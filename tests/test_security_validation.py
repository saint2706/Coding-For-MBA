"""
Tests for input validation security controls.
Ensures that the API rejects invalid or potentially malicious input.
"""
from fastapi.testclient import TestClient
from learner_backend.main import app, serializer
import pytest
import os
from importlib import reload
import learner_backend.main

# Reload to ensure clean state
reload(learner_backend.main)
client = TestClient(app)

def test_progress_validation_invalid_day():
    """Test that day must be between 1 and 108."""
    # Authenticate first
    user_id = "test_user_valid"
    cookie = serializer.dumps(user_id)
    client.cookies.set("learner_user_id", cookie)

    response = client.post(
        "/api/v1/progress",
        json={"user_id": user_id, "day": 999, "status": "completed"}
    )
    # Pydantic validation returns 422
    assert response.status_code == 422

def test_progress_validation_huge_user_id():
    """Test that extremely long user_ids are rejected."""
    huge_id = "a" * 1000

    response = client.post(
        "/api/v1/progress",
        json={"user_id": huge_id, "day": 1, "status": "completed"}
    )
    assert response.status_code == 422

def test_progress_validation_invalid_chars_user_id():
    """Test that user_ids with invalid characters are rejected."""
    bad_id = "user/../traversal"

    response = client.post(
        "/api/v1/progress",
        json={"user_id": bad_id, "day": 1, "status": "completed"}
    )
    assert response.status_code == 422

def test_progress_validation_invalid_score():
    """Test that quiz score must be 0-100."""
    user_id = "test_user_score"
    cookie = serializer.dumps(user_id)
    client.cookies.set("learner_user_id", cookie)

    response = client.post(
        "/api/v1/progress",
        json={"user_id": user_id, "day": 1, "status": "completed", "quiz_score": 150}
    )
    assert response.status_code == 422

def test_certificate_validation_long_name():
    """Test that certificate name has length limit."""
    user_id = "test_user_cert"
    cookie = serializer.dumps(user_id)
    client.cookies.set("learner_user_id", cookie)

    long_name = "a" * 200
    response = client.post(
        "/api/v1/certificates",
        json={"user_id": user_id, "name": long_name, "phase": 1}
    )
    assert response.status_code == 422
