"""
Tests for security headers middleware.

Verifies that critical security headers are present in all responses to prevent
common web vulnerabilities like MIME-sniffing, clickjacking, and XSS.
"""

import os
from importlib import reload

import pytest
from fastapi.testclient import TestClient

import learner_backend.db as db

# Set environment variables for testing
os.environ["GITHUB_CLIENT_ID"] = "test_client_id"
os.environ["GITHUB_CLIENT_SECRET"] = "test_client_secret"
os.environ["DATABASE_URL"] = ":memory:"

# Reload main to ensure environment is properly set
import learner_backend.main  # noqa: E402

reload(learner_backend.main)
from learner_backend.main import app  # noqa: E402

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Reset database for each test."""
    db._conn = None
    db.init_db(":memory:")
    yield
    db._conn = None


def test_security_headers_on_root():
    """Test that security headers are present on the root endpoint."""
    response = client.get("/")

    assert response.status_code == 200
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert "Content-Security-Policy" in response.headers


def test_security_headers_on_api_endpoint():
    """Test that security headers are present on API endpoints."""
    # Create a test user first
    user_id = "test_user_123"
    signed_user_id = learner_backend.main.serializer.dumps(user_id)
    client.cookies.set("learner_user_id", signed_user_id)

    response = client.post(
        "/api/v1/progress",
        json={"user_id": user_id, "day": 1, "status": "started"},
    )

    assert response.status_code == 200
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert "Content-Security-Policy" in response.headers


def test_csp_header_granular_directives():
    """Test that CSP uses granular directives following least privilege principle."""
    response = client.get("/")

    csp = response.headers["Content-Security-Policy"]

    # Check for granular directives
    assert "default-src 'self'" in csp
    assert "style-src 'self'" in csp
    assert "script-src 'self'" in csp
    assert "unsafe-inline" not in csp
    assert "connect-src 'self'" in csp
    assert "img-src 'self'" in csp
    assert "object-src 'none'" in csp
    assert "base-uri 'self'" in csp
    assert "form-action 'self'" in csp
    assert "frame-ancestors 'none'" in csp


def test_csp_header_no_github_domains():
    """Test that CSP does not include unnecessary GitHub domains."""
    response = client.get("/")

    csp = response.headers["Content-Security-Policy"]

    # GitHub domains should NOT be present (OAuth is server-side)
    assert "github.com" not in csp
    assert "api.github.com" not in csp


def test_security_headers_on_static_files():
    """Test that security headers are present on static file responses."""
    response = client.get("/static/dashboard.html")

    # Dashboard should be served with security headers
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert "Content-Security-Policy" in response.headers


def test_x_content_type_options_prevents_mime_sniffing():
    """Test that X-Content-Type-Options header is set to prevent MIME-sniffing."""
    response = client.get("/")
    assert response.headers["X-Content-Type-Options"] == "nosniff"


def test_x_frame_options_prevents_clickjacking():
    """Test that X-Frame-Options header is set to prevent clickjacking."""
    response = client.get("/")
    assert response.headers["X-Frame-Options"] == "DENY"


def test_referrer_policy_limits_information_leakage():
    """Test that Referrer-Policy header limits information leakage."""
    response = client.get("/")
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"


def test_permissions_policy_header_present():
    """Test that Permissions-Policy header is set to disable powerful features."""
    response = client.get("/")
    assert "Permissions-Policy" in response.headers
    policy = response.headers["Permissions-Policy"]
    assert "accelerometer=()" in policy
    assert "camera=()" in policy
    assert "geolocation=()" in policy
    assert "gyroscope=()" in policy
    assert "magnetometer=()" in policy
    assert "microphone=()" in policy
    assert "payment=()" in policy
    assert "usb=()" in policy
