"""
Database module for learner progress tracking.

Uses SQLite for simplicity. Can be extended to use PostgreSQL or other databases
by changing the DATABASE_URL and using SQLAlchemy.
"""

import sqlite3
import uuid
from datetime import datetime
from typing import Dict, List, Optional

_conn = None


def get_connection(db_path: str = "learner.db") -> sqlite3.Connection:
    """Get or create a database connection."""
    global _conn
    if _conn is None:
        _conn = sqlite3.connect(db_path, check_same_thread=False)
        _conn.row_factory = sqlite3.Row
    return _conn


def init_db(db_path: str = "learner.db"):
    """Initialize database schema."""
    conn = get_connection(db_path)
    cursor = conn.cursor()

    # Users table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT,
            created_at TEXT NOT NULL,
            last_active TEXT
        )
    """
    )

    # Progress table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            day INTEGER NOT NULL,
            status TEXT NOT NULL,
            quiz_score INTEGER,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            UNIQUE(user_id, day)
        )
    """
    )

    # Badges table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS badges (
            badge_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            phase INTEGER NOT NULL,
            earned_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """
    )

    # Create indices
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id)")

    conn.commit()


def create_user(user_id: str, username: Optional[str] = None) -> bool:
    """Create a new user if they don't exist."""
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT OR IGNORE INTO users (user_id, username, created_at, last_active) VALUES (?, ?, ?, ?)",
            (user_id, username, datetime.now().isoformat(), datetime.now().isoformat()),
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"Error creating user: {e}")
        return False


def record_progress(
    user_id: str, day: int, status: str, quiz_score: Optional[int] = None
) -> bool:
    """Record or update progress for a lesson."""
    conn = get_connection()
    cursor = conn.cursor()

    # Ensure user exists
    create_user(user_id)

    try:
        cursor.execute(
            """
            INSERT INTO progress (user_id, day, status, quiz_score, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, day) DO UPDATE SET
                status = excluded.status,
                quiz_score = excluded.quiz_score,
                updated_at = excluded.updated_at
        """,
            (user_id, day, status, quiz_score, datetime.now().isoformat()),
        )

        # Update last active
        cursor.execute(
            "UPDATE users SET last_active = ? WHERE user_id = ?",
            (datetime.now().isoformat(), user_id),
        )

        conn.commit()
        return True
    except Exception as e:
        print(f"Error recording progress: {e}")
        return False


def get_user_progress(user_id: str) -> List[Dict]:
    """Get all progress records for a user."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT day, status, quiz_score, updated_at
        FROM progress
        WHERE user_id = ?
        ORDER BY day
    """,
        (user_id,),
    )

    rows = cursor.fetchall()
    return [
        {
            "day": row["day"],
            "status": row["status"],
            "quiz_score": row["quiz_score"],
            "updated_at": row["updated_at"],
        }
        for row in rows
    ]


def award_badge(user_id: str, phase: int) -> str:
    """Award a badge to a user for completing a phase."""
    conn = get_connection()
    cursor = conn.cursor()

    badge_id = f"badge_{uuid.uuid4().hex[:12]}"

    try:
        cursor.execute(
            """
            INSERT INTO badges (badge_id, user_id, phase, earned_at)
            VALUES (?, ?, ?, ?)
        """,
            (badge_id, user_id, phase, datetime.now().isoformat()),
        )

        conn.commit()
        return badge_id
    except Exception as e:
        print(f"Error awarding badge: {e}")
        return ""


def get_user_badges(user_id: str) -> List[Dict]:
    """Get all badges earned by a user."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT badge_id, phase, earned_at
        FROM badges
        WHERE user_id = ?
        ORDER BY earned_at DESC
    """,
        (user_id,),
    )

    rows = cursor.fetchall()
    return [
        {
            "badge_id": row["badge_id"],
            "phase": row["phase"],
            "earned_at": row["earned_at"],
        }
        for row in rows
    ]


def get_user_stats(user_id: str) -> Dict:
    """Get summary statistics for a user."""
    conn = get_connection()
    cursor = conn.cursor()

    # Get total lessons
    cursor.execute(
        """
        SELECT COUNT(*) as total,
               SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
               AVG(CASE WHEN quiz_score IS NOT NULL THEN quiz_score END) as avg_quiz_score
        FROM progress
        WHERE user_id = ?
    """,
        (user_id,),
    )

    row = cursor.fetchone()

    # Get badge count
    cursor.execute(
        "SELECT COUNT(*) as badge_count FROM badges WHERE user_id = ?", (user_id,)
    )
    badge_row = cursor.fetchone()

    # Get streak (consecutive days with activity)
    cursor.execute(
        """
        SELECT updated_at
        FROM progress
        WHERE user_id = ?
        ORDER BY updated_at DESC
        LIMIT 30
    """,
        (user_id,),
    )

    dates = cursor.fetchall()
    streak = calculate_streak(dates)

    return {
        "total_lessons": row["total"] or 0,
        "completed_lessons": row["completed"] or 0,
        "avg_quiz_score": round(row["avg_quiz_score"] or 0, 1),
        "badges_earned": badge_row["badge_count"] or 0,
        "current_streak": streak,
    }


def calculate_streak(date_rows: List) -> int:
    """Calculate current learning streak in days."""
    if not date_rows:
        return 0

    from datetime import date, timedelta

    # Extract unique dates
    dates = set()
    for row in date_rows:
        dt = datetime.fromisoformat(row["updated_at"])
        dates.add(dt.date())

    if not dates:
        return 0

    # Check for consecutive days
    sorted_dates = sorted(dates, reverse=True)
    today = date.today()

    # Must have activity today or yesterday to have a streak
    if sorted_dates[0] not in [today, today - timedelta(days=1)]:
        return 0

    streak = 1
    current = sorted_dates[0]

    for next_date in sorted_dates[1:]:
        if current - next_date == timedelta(days=1):
            streak += 1
            current = next_date
        else:
            break

    return streak
