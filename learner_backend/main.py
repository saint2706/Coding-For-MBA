"""
Learner Progress Tracking Backend

A lightweight FastAPI application for tracking learner progress, managing badges,
and generating certificates. Supports optional GitHub OAuth or cookie-only mode.

Run with:
    uvicorn learner_backend.main:app --reload

Or:
    python -m learner_backend.main

Environment variables:
    GITHUB_CLIENT_ID - GitHub OAuth app client ID (optional)
    GITHUB_CLIENT_SECRET - GitHub OAuth app secret (optional)
    SECRET_KEY - JWT signing secret (generated if not provided)
    DATABASE_URL - SQLite database path (default: learner.db)
"""

import os
import secrets
import uuid
from datetime import datetime
from typing import Optional

import uvicorn
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import db

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
DATABASE_URL = os.getenv("DATABASE_URL", "learner.db")

# OAuth mode detection
OAUTH_ENABLED = bool(GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET)

# Initialize FastAPI app
app = FastAPI(
    title="Coding for MBA - Learner Progress API",
    description="Track your learning progress, earn badges, and get certificates",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
db.init_db(DATABASE_URL)


# Pydantic models
class ProgressUpdate(BaseModel):
    user_id: str
    day: int
    status: str  # 'started', 'in_progress', 'completed'
    quiz_score: Optional[int] = None


class User(BaseModel):
    user_id: str
    username: Optional[str] = None
    created_at: Optional[str] = None


class Badge(BaseModel):
    badge_id: str
    user_id: str
    phase: int
    earned_at: str


class CertificateRequest(BaseModel):
    user_id: str
    name: str
    phase: int


# Helper functions
def get_or_create_anonymous_user(request: Request, response: Response) -> str:
    """Get or create an anonymous user ID from cookies."""
    user_id = request.cookies.get("learner_user_id")

    if not user_id:
        user_id = f"anon_{uuid.uuid4().hex[:12]}"
        response.set_cookie(
            key="learner_user_id",
            value=user_id,
            max_age=60 * 60 * 24 * 365,  # 1 year
            httponly=True,
            samesite="lax",
        )
        # Create user in database
        db.create_user(user_id, None)

    return user_id


# Routes
@app.get("/")
async def root():
    """API root endpoint."""
    mode = "OAuth (GitHub)" if OAUTH_ENABLED else "Cookie-only (Anonymous)"
    return {
        "service": "Coding for MBA Learner Progress API",
        "version": "1.0.0",
        "auth_mode": mode,
        "endpoints": {
            "auth": "/api/v1/auth/github" if OAUTH_ENABLED else None,
            "progress": "/api/v1/progress",
            "badges": "/api/v1/badges/{user_id}",
            "certificates": "/api/v1/certificates",
            "dashboard": "/static/dashboard.html",
        },
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/v1/auth/github")
async def github_oauth_callback(code: str):
    """
    GitHub OAuth callback handler.
    Only available if GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are set.
    """
    if not OAUTH_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.",
        )

    # TODO: Implement full OAuth flow with GitHub API
    # This is a placeholder for the OAuth implementation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="OAuth implementation pending. Use cookie-only mode for now.",
    )


@app.post("/api/v1/progress")
async def record_progress(
    progress: ProgressUpdate, request: Request, response: Response
):
    """Record progress for a lesson."""
    # In cookie-only mode, use anonymous user
    if not OAUTH_ENABLED:
        user_id = get_or_create_anonymous_user(request, response)
        progress.user_id = user_id

    # Validate day number
    if not (1 <= progress.day <= 108):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Day must be between 1 and 108",
        )

    # Record progress
    db.record_progress(
        progress.user_id, progress.day, progress.status, progress.quiz_score
    )

    # Check if badge should be awarded
    phase = get_phase_for_day(progress.day)
    if should_award_badge(progress.user_id, phase):
        badge_id = db.award_badge(progress.user_id, phase)
        return {
            "success": True,
            "progress_recorded": True,
            "badge_awarded": True,
            "badge_id": badge_id,
            "phase": phase,
        }

    return {"success": True, "progress_recorded": True}


@app.get("/api/v1/progress/{user_id}")
async def get_progress(user_id: str):
    """Get progress summary for a user."""
    progress = db.get_user_progress(user_id)

    if not progress:
        return {
            "user_id": user_id,
            "total_lessons": 0,
            "completed": 0,
            "in_progress": 0,
            "completion_percentage": 0,
            "lessons": [],
        }

    completed_count = sum(1 for p in progress if p["status"] == "completed")
    in_progress_count = sum(1 for p in progress if p["status"] == "in_progress")

    return {
        "user_id": user_id,
        "total_lessons": len(progress),
        "completed": completed_count,
        "in_progress": in_progress_count,
        "completion_percentage": round(completed_count / 108 * 100, 1),
        "lessons": progress,
    }


@app.get("/api/v1/badges/{user_id}")
async def get_badges(user_id: str):
    """Get badges earned by a user."""
    badges = db.get_user_badges(user_id)

    return {"user_id": user_id, "badge_count": len(badges), "badges": badges}


@app.post("/api/v1/certificates")
async def request_certificate(cert_request: CertificateRequest):
    """
    Generate and return a certificate for a completed phase.
    Requires the user to have completed all lessons in the phase.
    """
    # Check if user has completed the phase
    progress = db.get_user_progress(cert_request.user_id)
    phase_lessons = get_lessons_for_phase(cert_request.phase)

    completed_in_phase = sum(
        1 for p in progress if p["day"] in phase_lessons and p["status"] == "completed"
    )

    if completed_in_phase < len(phase_lessons):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Complete all {len(phase_lessons)} lessons in Phase {cert_request.phase} to earn certificate",
        )

    # Generate certificate (would call generate_certificate.py)
    # For now, return a placeholder
    return {
        "success": True,
        "message": "Certificate generation not yet implemented",
        "certificate_url": f"/certificates/{cert_request.user_id}_phase_{cert_request.phase}.pdf",
    }


@app.get("/api/v1/adaptive/suggest")
async def suggest_next_lesson(user_id: str):
    """
    Suggest next lesson based on progress and quiz scores.
    Simple rule-based engine.
    """
    progress = db.get_user_progress(user_id)

    if not progress:
        return {
            "suggested_lesson": 1,
            "reason": "Start with Day 1 - Introduction to Python",
        }

    # Find last completed lesson
    completed = [p for p in progress if p["status"] == "completed"]
    if not completed:
        return {"suggested_lesson": 1, "reason": "Complete Day 1 first"}

    last_completed = max(completed, key=lambda x: x["day"])
    next_day = last_completed["day"] + 1

    if next_day > 108:
        return {
            "suggested_lesson": None,
            "reason": "Congratulations! You've completed the entire curriculum!",
        }

    # Check average quiz score
    quiz_scores = [p.get("quiz_score", 0) for p in progress if p.get("quiz_score")]
    avg_score = sum(quiz_scores) / len(quiz_scores) if quiz_scores else 0

    if avg_score < 60:
        return {
            "suggested_lesson": next_day,
            "reason": "Review fundamentals before advancing",
            "recommendation": "Consider revisiting earlier lessons to strengthen foundation",
        }

    return {"suggested_lesson": next_day, "reason": f"Continue with Day {next_day}"}


# Helper functions for phase and badge logic
def get_phase_for_day(day: int) -> int:
    """Get phase number for a given day."""
    if 1 <= day <= 20:
        return 1
    elif 21 <= day <= 39:
        return 2
    elif 40 <= day <= 54:
        return 3
    elif 55 <= day <= 67:
        return 4
    elif 68 <= day <= 84:
        return 5
    elif 85 <= day <= 90:
        return 6
    elif 91 <= day <= 108:
        return 7
    return 0


def get_lessons_for_phase(phase: int) -> list:
    """Get list of day numbers for a phase."""
    phase_ranges = {
        1: range(1, 21),
        2: range(21, 40),
        3: range(40, 55),
        4: range(55, 68),
        5: range(68, 85),
        6: range(85, 91),
        7: range(91, 109),
    }
    return list(phase_ranges.get(phase, []))


def should_award_badge(user_id: str, phase: int) -> bool:
    """Check if user should be awarded a badge for completing a phase."""
    progress = db.get_user_progress(user_id)
    phase_lessons = get_lessons_for_phase(phase)

    completed_in_phase = sum(
        1 for p in progress if p["day"] in phase_lessons and p["status"] == "completed"
    )

    # Check if already has badge
    badges = db.get_user_badges(user_id)
    has_badge = any(b["phase"] == phase for b in badges)

    return completed_in_phase == len(phase_lessons) and not has_badge


# Mount static files (dashboard)
static_path = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_path):
    app.mount("/static", StaticFiles(directory=static_path), name="static")


def main():
    """Run the application."""
    print("=" * 60)
    print("🚀 Coding for MBA - Learner Progress Backend")
    print("=" * 60)
    print(
        f"Auth mode: {'OAuth (GitHub)' if OAUTH_ENABLED else 'Cookie-only (Anonymous)'}"
    )
    print(f"Database: {DATABASE_URL}")
    print("Dashboard: http://127.0.0.1:8000/static/dashboard.html")
    print("=" * 60)

    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
