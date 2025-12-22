import pytest
import os
from importlib import reload
from fastapi.testclient import TestClient
import learner_backend.main

@pytest.fixture(autouse=True)
def setup_env():
    """Ensure consistent environment for tests."""
    # Set known secret key for signing to ensure serializer works as expected
    os.environ["SECRET_KEY"] = "test_secret_key"
    # Enable OAuth to test the stricter path (401/403)
    # Use values consistent with other tests to avoid interference
    os.environ["GITHUB_CLIENT_ID"] = "test_client_id"
    os.environ["GITHUB_CLIENT_SECRET"] = "test_client_secret"
    os.environ["DATABASE_URL"] = ":memory:"

    # Reload main to pick up env vars and re-init app/serializer
    reload(learner_backend.main)

def test_cookie_tampering_prevention():
    """
    Verify that an attacker cannot impersonate a user by tampering with cookies.
    """
    # Import from reloaded module
    from learner_backend.main import app
    client = TestClient(app)

    target_user = "github_999"

    # 1. Try with plaintext cookie (tampering attempt)
    # The server should fail to unsign this, resulting in user_id=None.
    client.cookies.set("learner_user_id", target_user)

    # Since OAuth is enabled, no user_id -> 401 Unauthorized
    response = client.get(f"/api/v1/progress/{target_user}")

    assert response.status_code in [401, 403], f"Tampered cookie allowed access! Status: {response.status_code}"

def test_signed_cookie_access():
    """Verify that a valid signed cookie works."""
    # Import from reloaded module
    from learner_backend.main import app, serializer
    client = TestClient(app)

    user_id = "github_valid"
    signed_token = serializer.dumps(user_id)
    client.cookies.set("learner_user_id", signed_token)

    response = client.get(f"/api/v1/progress/{user_id}")
    assert response.status_code == 200
    assert response.json()["user_id"] == user_id
