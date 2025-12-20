import json
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
    db._conn = None
    db.init_db(":memory:")
    yield
    db._conn = None

@patch("httpx.AsyncClient")
def test_github_token_exchange_invalid_json(mock_client_cls):
    """Test handling of invalid JSON from GitHub during token exchange."""
    mock_client = AsyncMock()
    mock_client_cls.return_value.__aenter__.return_value = mock_client

    # Mock token response to return non-JSON
    mock_token_response = MagicMock()
    mock_token_response.status_code = 200
    mock_token_response.json.side_effect = json.JSONDecodeError("Expecting value", "", 0)
    mock_client.post.return_value = mock_token_response

    client.cookies.set("oauth_state", "valid_state")

    # Verify that the application returns a 502 Bad Gateway
    response = client.get(
        "/api/v1/auth/github?code=valid_code&state=valid_state", follow_redirects=False
    )
    assert response.status_code == 502
    assert "Invalid JSON response" in response.json()["detail"]

@patch("httpx.AsyncClient")
def test_github_user_info_invalid_json(mock_client_cls):
    """Test handling of invalid JSON from GitHub during user info fetch."""
    mock_client = AsyncMock()
    mock_client_cls.return_value.__aenter__.return_value = mock_client

    # Token exchange succeeds
    mock_token_response = MagicMock()
    mock_token_response.json.return_value = {"access_token": "valid_token"}
    mock_client.post.return_value = mock_token_response

    # User info returns invalid JSON
    mock_user_response = MagicMock()
    mock_user_response.json.side_effect = json.JSONDecodeError("Expecting value", "", 0)
    mock_client.get.return_value = mock_user_response

    client.cookies.set("oauth_state", "valid_state")

    response = client.get(
        "/api/v1/auth/github?code=valid_code&state=valid_state", follow_redirects=False
    )
    assert response.status_code == 502
    assert "Invalid JSON response" in response.json()["detail"]

@patch("httpx.AsyncClient")
def test_github_token_exchange_network_error(mock_client_cls):
    """Test handling of network error during token exchange."""
    import httpx
    mock_client = AsyncMock()
    mock_client_cls.return_value.__aenter__.return_value = mock_client

    # Simulate network error
    mock_client.post.side_effect = httpx.ConnectError("Connection failed")

    client.cookies.set("oauth_state", "valid_state")

    response = client.get(
        "/api/v1/auth/github?code=valid_code&state=valid_state", follow_redirects=False
    )
    assert response.status_code == 502
    assert "GitHub token exchange failed" in response.json()["detail"]
