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
from enum import Enum
from typing import Optional

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from itsdangerous import BadSignature, URLSafeTimedSerializer
from pydantic import BaseModel, Field

from . import db
from .ratelimit import RateLimiter

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
serializer = URLSafeTimedSerializer(SECRET_KEY)
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
DATABASE_URL = os.getenv("DATABASE_URL", "learner.db")
TRUSTED_PROXIES = os.getenv("TRUSTED_PROXIES", "")

# OAuth mode detection
OAUTH_ENABLED = bool(GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET)

# Initialize FastAPI app
app = FastAPI(
    title="Coding for MBA - Learner Progress API",
    description="Track your learning progress, earn badges, and get certificates",
    version="1.0.0",
)

# Rate Limiter (60 requests/minute per IP)
rate_limiter = RateLimiter(requests_per_minute=60)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Rate limit requests based on client IP."""
    # Skip rate limiting for static files
    if request.url.path.startswith("/static"):
        return await call_next(request)

    # Get client IP, checking for proxy headers first
    client_ip = request.client.host if request.client else "unknown"

    # Check for X-Forwarded-For or X-Real-IP headers ONLY if configured to trust proxies
    # This prevents IP spoofing attacks where attackers inject fake headers
    # Use positive allowlist: only specific values enable the feature (fail-secure)
    if TRUSTED_PROXIES and TRUSTED_PROXIES.lower() in ("true", "1", "yes", "*"):
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # TRUSTED_PROXIES has already been validated above; since it is enabled,
            # we treat X-Forwarded-For as the authoritative source for the client IP.
            # In a real production setup, we should verify the request comes from a trusted proxy IP.
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            real_ip = request.headers.get("X-Real-IP")
            if real_ip:
                client_ip = real_ip.strip()

    if not rate_limiter.is_allowed(client_ip):
        # Calculate reset timestamp (window is 60 seconds)
        window_seconds = 60
        reset_timestamp = int(datetime.now().timestamp()) + window_seconds
        headers = {
            "Retry-After": str(window_seconds),
            "X-RateLimit-Limit": str(rate_limiter.requests_per_minute),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": str(reset_timestamp),
        }
        return Response(
            content="Too Many Requests",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            media_type="text/plain",
            headers=headers,
        )

    return await call_next(request)


# CORS middleware
# Note: allow_origins=[] restricts cross-origin requests since dashboard.html is served
# from the same origin. If deploying a separate frontend on a different domain,
# explicitly configure allowed origins here (e.g., ["https://yourdomain.com"]).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],  # Restrictive by default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    # Use granular CSP directives following principle of least privilege.
    # Note: OAuth redirects are HTTP-level (server-side) and do not require CSP entries.
    # - default-src 'self': All resources from same origin by default
    # - style-src 'self': Allow styles from same origin (dashboard.css)
    # - script-src 'self': Allow scripts from same origin (dashboard.js)
    # - connect-src 'self': API calls to same origin only
    # - img-src 'self': Images from same origin only
    # - object-src 'none': Block plugins like Flash/Java
    # - base-uri 'self': Prevent base tag hijacking
    # - form-action 'self': Restrict form submissions to same origin
    # - frame-ancestors 'none': Prevent embedding in iframes (Clickjacking protection)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "style-src 'self'; "
        "script-src 'self'; "
        "connect-src 'self'; "
        "img-src 'self'; "
        "object-src 'none'; "
        "base-uri 'self'; "
        "form-action 'self'; "
        "frame-ancestors 'none';"
    )
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# Initialize database
db.init_db(DATABASE_URL)


# Pydantic models
class LessonStatus(str, Enum):
    STARTED = "started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class ProgressUpdate(BaseModel):
    user_id: str = Field(..., pattern=r"^[a-zA-Z0-9_-]+$")
    day: int = Field(..., ge=1, le=108)
    status: LessonStatus
    quiz_score: Optional[int] = Field(None, ge=0, le=100)


class User(BaseModel):
    user_id: str = Field(..., pattern=r"^[a-zA-Z0-9_-]+$")
    username: Optional[str] = None
    created_at: Optional[str] = None


class Badge(BaseModel):
    badge_id: str
    user_id: str
    phase: int
    earned_at: str


class CertificateRequest(BaseModel):
    user_id: str = Field(..., pattern=r"^[a-zA-Z0-9_-]+$")
    name: str = Field(..., min_length=1, max_length=100, pattern=r"^[\w\s\-\.\']+$")
    phase: int = Field(..., ge=1, le=7)


# Helper functions
def get_current_user_id(request: Request) -> Optional[str]:
    """
    Retrieve and verify the user ID from the signed cookie.
    Returns None if cookie is missing or invalid.
    """
    cookie = request.cookies.get("learner_user_id")
    if not cookie:
        return None
    try:
        # Verify signature and expiration (max_age matching cookie lifetime)
        user_id = serializer.loads(cookie, max_age=60 * 60 * 24 * 365)
        return user_id
    except BadSignature:
        return None


def verify_user_access(request: Request, target_user_id: str):
    """Verify that the requester is authorized to access the target user's data."""
    current_user_id = get_current_user_id(request)

    if OAUTH_ENABLED:
        if not current_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
            )
        if current_user_id != target_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only access your own data",
            )
    # In anonymous mode, enforce ID matches. If no cookie (None), access is denied.
    elif current_user_id != target_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )


def get_or_create_anonymous_user(request: Request, response: Response) -> str:
    """Get or create an anonymous user ID from cookies."""
    user_id = get_current_user_id(request)

    if not user_id:
        user_id = f"anon_{uuid.uuid4().hex[:12]}"
        signed_token = serializer.dumps(user_id)
        response.set_cookie(
            key="learner_user_id",
            value=signed_token,
            max_age=60 * 60 * 24 * 365,  # 1 year
            httponly=True,
            samesite="lax",
            secure=True,
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
            "auth": "/api/v1/auth/login" if OAUTH_ENABLED else None,
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


@app.get("/api/v1/auth/login")
async def github_oauth_login(request: Request):
    """Redirect to GitHub for OAuth."""
    if not OAUTH_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="OAuth not configured.",
        )

    redirect_uri = str(request.url_for("github_oauth_callback"))
    state_token = secrets.token_urlsafe(16)

    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": "read:user",
        "state": state_token,
    }

    from urllib.parse import urlencode

    query = urlencode(params)

    res = Response(
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        headers={"Location": f"https://github.com/login/oauth/authorize?{query}"},
    )

    res.set_cookie(
        key="oauth_state",
        value=state_token,
        max_age=600,  # 10 minutes
        httponly=True,
        samesite="lax",
        secure=True,
    )
    return res


@app.get("/api/v1/auth/github")
async def github_oauth_callback(
    code: str, state: str, request: Request, response: Response
):
    """
    GitHub OAuth callback handler.
    Exchanges code for token, gets user info, creates user, sets cookie.
    """
    if not OAUTH_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="OAuth not configured.",
        )

    # Verify state parameter
    cookie_state = request.cookies.get("oauth_state")
    if not cookie_state or cookie_state != state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state parameter"
        )

    # Exchange code for token
    # Ensure redirect_uri matches the one used in the authorization request
    redirect_uri = str(request.url_for("github_oauth_callback"))

    try:
        async with httpx.AsyncClient() as client:
            token_res = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": GITHUB_CLIENT_ID,
                    "client_secret": GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": redirect_uri,
                },
            )
            token_res.raise_for_status()
            token_data = token_res.json()
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GitHub token exchange failed: {str(e)}",
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid JSON response from GitHub token exchange",
        )

    access_token = token_data.get("access_token")
    if not access_token:
        # Check for error from GitHub
        error = token_data.get("error_description", "Unknown error")
        raise HTTPException(
            status_code=400, detail=f"Failed to retrieve access token: {error}"
        )

    # Get user info
    try:
        async with httpx.AsyncClient() as client:
            user_res = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                },
            )
            user_res.raise_for_status()
            user_data = user_res.json()
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GitHub user info fetch failed: {str(e)}",
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid JSON response from GitHub user info",
        )

    github_id = user_data.get("id")
    username = user_data.get("login")

    if not github_id:
        raise HTTPException(status_code=400, detail="Failed to retrieve user info")

    user_id = f"github_{github_id}"

    # Create/Update user in DB
    db.create_user(user_id, username)

    # Redirect to dashboard
    redirect_url = "/static/dashboard.html"

    res = Response(
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        headers={"Location": redirect_url},
    )

    signed_token = serializer.dumps(user_id)
    res.set_cookie(
        key="learner_user_id",
        value=signed_token,
        max_age=60 * 60 * 24 * 365,
        httponly=True,
        samesite="lax",
        secure=True,
    )

    # Clear state cookie
    res.delete_cookie("oauth_state")

    return res


@app.post("/api/v1/progress")
async def record_progress(
    progress: ProgressUpdate, request: Request, response: Response
):
    """Record progress for a lesson."""
    # Verify authorization
    if not OAUTH_ENABLED:
        # In cookie-only mode, ensure we use/create the anonymous user
        user_id = get_current_user_id(request)
        if not user_id:
            user_id = get_or_create_anonymous_user(request, response)
        progress.user_id = user_id
    else:
        # Check against cookie
        verify_user_access(request, progress.user_id)

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
            "user_id": progress.user_id,
        }

    return {"success": True, "progress_recorded": True, "user_id": progress.user_id}


@app.get("/api/v1/progress/{user_id}")
async def get_progress(user_id: str, request: Request):
    """Get progress summary for a user."""
    verify_user_access(request, user_id)

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
async def get_badges(user_id: str, request: Request):
    """Get badges earned by a user."""
    verify_user_access(request, user_id)

    badges = db.get_user_badges(user_id)

    return {"user_id": user_id, "badge_count": len(badges), "badges": badges}


@app.post("/api/v1/certificates")
async def request_certificate(cert_request: CertificateRequest, request: Request):
    """
    Generate and return a certificate for a completed phase.
    Requires the user to have completed all lessons in the phase.
    """
    verify_user_access(request, cert_request.user_id)

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
async def suggest_next_lesson(user_id: str, request: Request):
    """
    Suggest next lesson based on progress and quiz scores.
    Simple rule-based engine.
    """
    verify_user_access(request, user_id)

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
