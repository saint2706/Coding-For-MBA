import os
from importlib import reload

import pytest
from fastapi.testclient import TestClient

import learner_backend.db as db

# Set environment variables for testing to enable OAuth
os.environ["GITHUB_CLIENT_ID"] = "test_client_id"
os.environ["GITHUB_CLIENT_SECRET"] = "test_client_secret"
os.environ["DATABASE_URL"] = ":memory:"

# Reload main to ensure OAUTH_ENABLED is True
import learner_backend.main  # noqa: E402

reload(learner_backend.main)
from learner_backend.main import app  # noqa: E402

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    # Reset database connection to ensure isolation
    db._conn = None
    db.init_db(":memory:")
    yield
    db._conn = None


def test_record_progress_idor_prevention():
    """
    Test that a user cannot record progress for another user (IDOR).
    """
    # 1. Simulate an authenticated user "attacker"
    attacker_id = "github_attacker"
    victim_id = "github_victim"

    # Create the victim user in the DB so valid FK constraints (if any) are met
    # though the current DB doesn't enforce FK strictly or we need to create it anyway.
    db.create_user(victim_id, "victim_user")
    db.create_user(attacker_id, "attacker_user")

    # Set the cookie to authenticate as attacker (signed)
    signed_attacker_id = learner_backend.main.serializer.dumps(attacker_id)
    client.cookies.set("learner_user_id", signed_attacker_id)

    # 2. Attempt to update progress for the victim
    payload = {"user_id": victim_id, "day": 1, "status": "completed", "quiz_score": 100}

    response = client.post("/api/v1/progress", json=payload)

    # 3. Assert that the request is forbidden (403) or at least not successful (200)
    # Currently, this will fail (it returns 200), demonstrating the vulnerability.
    assert (
        response.status_code == 403
    ), f"IDOR Vulnerability! Attacker was able to update victim's progress. Status: {response.status_code}"

    # Verify in DB that victim's progress was NOT updated
    progress = db.get_user_progress(victim_id)
    assert (
        len(progress) == 0
    ), "IDOR Vulnerability! Victim's progress was updated in DB."


def test_get_progress_idor_prevention():
    """
    Test that a user cannot view progress of another user (IDOR).
    """
    # 1. Setup victim data
    victim_id = "github_victim"
    db.create_user(victim_id, "victim_user")
    db.record_progress(victim_id, 1, "completed", 100)

    # 2. Authenticate as attacker
    attacker_id = "github_attacker"
    signed_attacker_id = learner_backend.main.serializer.dumps(attacker_id)
    client.cookies.set("learner_user_id", signed_attacker_id)

    # 3. Attempt to view victim's progress
    response = client.get(f"/api/v1/progress/{victim_id}")

    # 4. Assert 403 Forbidden
    assert (
        response.status_code == 403
    ), f"IDOR Vulnerability! Attacker could view victim's progress. Status: {response.status_code}"
