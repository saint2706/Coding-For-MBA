import os
from importlib import reload
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

import learner_backend.db as db
import learner_backend.main

# Set environment variables for testing
os.environ["GITHUB_CLIENT_ID"] = "test_client_id"
os.environ["GITHUB_CLIENT_SECRET"] = "test_client_secret"
os.environ["DATABASE_URL"] = ":memory:"

# Reload main to ensure OAUTH_ENABLED is True and DB is init with memory
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


def test_login_endpoint_exists():
    """Test that /api/v1/auth/login exists, redirects to GitHub, and sets state."""
    response = client.get("/api/v1/auth/login", follow_redirects=False)
    assert response.status_code in (302, 307)
    assert "github.com/login/oauth/authorize" in response.headers["location"]
    assert "client_id=test_client_id" in response.headers["location"]
    assert "state=" in response.headers["location"]
    assert "oauth_state" in response.cookies


@patch("httpx.AsyncClient")
def test_github_callback_flow(mock_client_cls):
    """Test the full OAuth callback flow with state verification."""
    # Mock httpx client
    mock_client = AsyncMock()
    mock_client_cls.return_value.__aenter__.return_value = mock_client

    # Mock token response object
    mock_token_response = MagicMock()
    mock_token_response.json.return_value = {
        "access_token": "mock_token",
        "token_type": "bearer",
    }
    mock_client.post.return_value = mock_token_response

    # Mock user info response object
    mock_user_response = MagicMock()
    mock_user_response.json.return_value = {"id": 98765, "login": "octocat"}
    mock_client.get.return_value = mock_user_response

    # Set state cookie
    client.cookies.set("oauth_state", "valid_state")

    # Call the callback endpoint with matching state
    response = client.get("/api/v1/auth/github?code=valid_code&state=valid_state", follow_redirects=False)

    # Verify redirect to dashboard
    assert response.status_code in (302, 307)
    assert response.headers["location"] in ["/", "/static/dashboard.html"]

    # Verify cookie was set
    assert "learner_user_id" in response.cookies
    assert response.cookies["learner_user_id"] == "github_98765"

    # Verify user was created in DB
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id = ?", ("github_98765",))
    user = cursor.fetchone()
    assert user is not None
    assert user["username"] == "octocat"


def test_github_callback_invalid_state():
    """Test that callback fails with invalid state."""
    client.cookies.set("oauth_state", "valid_state")
    response = client.get("/api/v1/auth/github?code=valid_code&state=wrong_state", follow_redirects=False)
    assert response.status_code == 400
    assert "Invalid state" in response.json()["detail"]


def test_github_callback_missing_state_cookie():
    """Test that callback fails when state cookie is missing."""
    client.cookies.clear()
    response = client.get("/api/v1/auth/github?code=valid_code&state=some_state", follow_redirects=False)
    assert response.status_code == 400
    assert "Invalid state" in response.json()["detail"]
