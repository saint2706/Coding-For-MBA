import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from learner_backend.main import app, serializer

client = TestClient(app)

@pytest.fixture
def auth_headers():
    # Create a dummy user and sign a cookie
    user_id = "github_12345"
    signed_token = serializer.dumps(user_id)
    return {"learner_user_id": signed_token}

def test_certificate_request_huge_name(auth_headers):
    """Test that requesting a certificate with a huge name returns 422."""
    huge_name = "A" * 10001

    client.cookies.set("learner_user_id", auth_headers["learner_user_id"])

    response = client.post(
        "/api/v1/certificates",
        json={
            "user_id": "github_12345",
            "name": huge_name,
            "phase": 1
        }
    )

    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    # Verify the error detail mentions 'name'
    errors = response.json().get("detail", [])
    assert any(e["loc"] == ["body", "name"] for e in errors)

def test_certificate_request_xss_name(auth_headers):
    """Test that requesting a certificate with invalid characters returns 422."""
    xss_name = "<script>alert('xss')</script>"

    client.cookies.set("learner_user_id", auth_headers["learner_user_id"])

    response = client.post(
        "/api/v1/certificates",
        json={
            "user_id": "github_12345",
            "name": xss_name,
            "phase": 1
        }
    )

    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    errors = response.json().get("detail", [])
    assert any(e["loc"] == ["body", "name"] for e in errors)

def test_progress_update_invalid_day(auth_headers):
    """Test that progress update with invalid day returns 422."""

    client.cookies.set("learner_user_id", auth_headers["learner_user_id"])

    response = client.post(
        "/api/v1/progress",
        json={
            "user_id": "github_12345",
            "day": 999,
            "status": "completed"
        }
    )

    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    errors = response.json().get("detail", [])
    assert any(e["loc"] == ["body", "day"] for e in errors)

def test_valid_certificate_request(auth_headers):
    """Test that valid inputs are accepted (mocking internals)."""
    # We mock verify_user_access and db.get_user_progress to pass logical checks
    # This ensures that valid inputs pass the Pydantic validation layer

    with patch("learner_backend.main.verify_user_access"), \
         patch("learner_backend.db.get_user_progress") as mock_progress, \
         patch("learner_backend.main.get_lessons_for_phase") as mock_lessons:

        mock_progress.return_value = [{"day": 1, "status": "completed"}]
        mock_lessons.return_value = [1]

        client.cookies.set("learner_user_id", auth_headers["learner_user_id"])

        response = client.post(
            "/api/v1/certificates",
            json={
                "user_id": "github_12345",
                "name": "Jane Doe",
                "phase": 1
            }
        )

        assert response.status_code == 200
        assert response.json()["success"] is True

def test_certificate_request_with_apostrophe(auth_headers):
    """Test that names with apostrophes are accepted."""
    with patch("learner_backend.main.verify_user_access"), \
         patch("learner_backend.db.get_user_progress") as mock_progress, \
         patch("learner_backend.main.get_lessons_for_phase") as mock_lessons:

        mock_progress.return_value = [{"day": 1, "status": "completed"}]
        mock_lessons.return_value = [1]

        client.cookies.set("learner_user_id", auth_headers["learner_user_id"])

        response = client.post(
            "/api/v1/certificates",
            json={
                "user_id": "github_12345",
                "name": "O'Connor",
                "phase": 1
            }
        )

        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
