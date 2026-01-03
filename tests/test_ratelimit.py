"""
Tests for the rate limiter implementation.
"""

import time
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from learner_backend.main import app
from learner_backend.ratelimit import RateLimiter


class TestRateLimiterBasic:
    """Test basic rate limiter functionality."""

    def test_rate_limiter_allows_requests_under_limit(self):
        """Test that requests under the limit are allowed."""
        limiter = RateLimiter(requests_per_minute=5)
        client_ip = "192.168.1.1"

        # Make 5 requests (at limit)
        for _ in range(5):
            assert limiter.is_allowed(client_ip) is True

    def test_rate_limiter_blocks_requests_over_limit(self):
        """Test that requests over the limit are blocked."""
        limiter = RateLimiter(requests_per_minute=5)
        client_ip = "192.168.1.1"

        # Make 5 requests (at limit)
        for _ in range(5):
            assert limiter.is_allowed(client_ip) is True

        # 6th request should be blocked
        assert limiter.is_allowed(client_ip) is False

    def test_rate_limiter_per_ip_isolation(self):
        """Test that different IPs are rate limited independently."""
        limiter = RateLimiter(requests_per_minute=3)
        ip1 = "192.168.1.1"
        ip2 = "192.168.1.2"

        # IP1 makes 3 requests
        for _ in range(3):
            assert limiter.is_allowed(ip1) is True

        # IP1 is now blocked
        assert limiter.is_allowed(ip1) is False

        # IP2 should still be allowed
        assert limiter.is_allowed(ip2) is True
        assert limiter.is_allowed(ip2) is True
        assert limiter.is_allowed(ip2) is True

        # IP2 is now also blocked
        assert limiter.is_allowed(ip2) is False

    def test_rate_limiter_unknown_ip(self):
        """Test that unknown IP addresses are handled correctly."""
        limiter = RateLimiter(requests_per_minute=2)
        unknown_ip = "unknown"

        assert limiter.is_allowed(unknown_ip) is True
        assert limiter.is_allowed(unknown_ip) is True
        assert limiter.is_allowed(unknown_ip) is False

    def test_rate_limiter_sliding_window(self):
        """Test that the sliding window correctly expires old requests."""
        limiter = RateLimiter(requests_per_minute=2)
        client_ip = "192.168.1.1"

        # Make 2 requests
        assert limiter.is_allowed(client_ip) is True
        assert limiter.is_allowed(client_ip) is True

        # 3rd request should be blocked
        assert limiter.is_allowed(client_ip) is False

        # Mock time to advance by 61 seconds
        base_time = time.time()
        with patch("time.time", return_value=base_time + 61):
            # Should now be allowed again as old requests expired
            assert limiter.is_allowed(client_ip) is True


class TestRateLimiterCleanup:
    """Test rate limiter cleanup logic."""

    def test_cleanup_removes_stale_ips(self):
        """Test that cleanup removes IPs with no recent requests."""
        limiter = RateLimiter(requests_per_minute=5)
        base_time = time.time()

        # Add requests for multiple IPs
        with patch("time.time", return_value=base_time):
            for i in range(5):
                limiter.is_allowed(f"192.168.1.{i}")

        # Verify IPs are tracked
        assert len(limiter.requests) == 5

        # Mock time to advance by 61 seconds (past the window)
        future_time = base_time + 61
        with patch("time.time", return_value=future_time):
            # Force cleanup by setting last_cleanup to old time
            limiter._last_cleanup = base_time

            # Trigger cleanup with a new request
            limiter.is_allowed("192.168.1.100")

            # Old IPs should be cleaned up, only new IP remains
            assert len(limiter.requests) == 1
            assert "192.168.1.100" in limiter.requests

    def test_cleanup_respects_interval(self):
        """Test that cleanup only runs at configured intervals."""
        limiter = RateLimiter(requests_per_minute=5, cleanup_interval_seconds=30.0)
        base_time = time.time()

        # Add requests for multiple IPs
        with patch("time.time", return_value=base_time):
            for i in range(5):
                limiter.is_allowed(f"192.168.1.{i}")

            # Record when last cleanup happened
            initial_cleanup_time = limiter._last_cleanup

            # Make more requests within the interval
            limiter.is_allowed("192.168.1.10")

            # Cleanup time should not have changed (cleanup didn't run)
            assert limiter._last_cleanup == initial_cleanup_time

        # Mock time to advance past the interval
        future_time = base_time + 31
        with patch("time.time", return_value=future_time):
            # This should trigger cleanup
            limiter.is_allowed("192.168.1.11")

            # Cleanup time should be updated
            assert limiter._last_cleanup == future_time

    def test_cleanup_keeps_active_ips(self):
        """Test that cleanup preserves IPs with recent requests."""
        limiter = RateLimiter(requests_per_minute=5)
        base_time = time.time()

        # Add requests for multiple IPs at base time
        with patch("time.time", return_value=base_time):
            limiter.is_allowed("192.168.1.1")
            limiter.is_allowed("192.168.1.2")

        # Mock time to advance by 61 seconds and add new IP
        future_time = base_time + 61
        with patch("time.time", return_value=future_time):
            # Force cleanup time update to trigger cleanup
            limiter._last_cleanup = base_time

            # IP 3 makes a request in the "future"
            limiter.is_allowed("192.168.1.3")

            # IP 3 should remain as it's recent
            assert "192.168.1.3" in limiter.requests
            # Old IPs (1 and 2) should be cleaned since they're past the 60s window
            assert "192.168.1.1" not in limiter.requests


class TestRateLimitMiddleware:
    """Test rate limiting middleware integration."""

    @pytest.fixture(autouse=True)
    def reset_rate_limiter(self):
        """Reset the rate limiter before each test."""
        from learner_backend.main import rate_limiter

        # Clear all tracked IPs
        rate_limiter.requests.clear()
        rate_limiter._last_cleanup = time.time()
        yield

    def test_middleware_allows_requests_under_limit(self):
        """Test that middleware allows requests under the rate limit."""
        client = TestClient(app)

        # Make multiple requests under the limit
        for _ in range(5):
            response = client.get("/health")
            assert response.status_code == 200

    def test_middleware_blocks_requests_over_limit(self):
        """Test that middleware blocks requests exceeding the rate limit."""
        client = TestClient(app)

        # Make requests up to the limit (60 requests per minute)
        for i in range(60):
            response = client.get("/health")
            assert response.status_code == 200, f"Request {i+1} should succeed"

        # Next request should be rate limited
        response = client.get("/health")
        assert response.status_code == 429
        assert response.text == "Too Many Requests"

    def test_middleware_returns_rate_limit_headers(self):
        """Test that 429 response includes proper rate limiting headers."""
        client = TestClient(app)

        # Exhaust rate limit
        for _ in range(60):
            client.get("/health")

        # Next request should return 429 with headers
        response = client.get("/health")
        assert response.status_code == 429
        assert "retry-after" in response.headers
        assert response.headers["retry-after"] == "60"
        assert "x-ratelimit-limit" in response.headers
        assert response.headers["x-ratelimit-limit"] == "60"
        assert "x-ratelimit-remaining" in response.headers
        assert response.headers["x-ratelimit-remaining"] == "0"
        assert "x-ratelimit-reset" in response.headers

    def test_middleware_content_type(self):
        """Test that 429 response has correct content type."""
        client = TestClient(app)

        # Exhaust rate limit
        for _ in range(60):
            client.get("/health")

        # Next request should return 429 with text/plain content type
        response = client.get("/health")
        assert response.status_code == 429
        assert response.headers["content-type"] == "text/plain; charset=utf-8"

    def test_middleware_skips_static_files(self):
        """Test that static files are not rate limited."""
        client = TestClient(app)

        # Exhaust rate limit on API endpoints
        for _ in range(60):
            client.get("/health")

        # API should be rate limited
        response = client.get("/health")
        assert response.status_code == 429

        # But static files should still work
        # (may return 404 if file doesn't exist, but shouldn't be 429)
        response = client.get("/static/test.txt")
        assert response.status_code != 429

    def test_middleware_handles_x_forwarded_for(self):
        """Test that middleware respects X-Forwarded-For header."""
        # Enable trusted proxies for this test
        from learner_backend import main

        with patch.object(main, 'TRUSTED_PROXIES', '*'):
            client = TestClient(app)

            # Make requests with X-Forwarded-For header
            headers = {"X-Forwarded-For": "203.0.113.1, 198.51.100.1"}

            # Make requests up to limit
            for i in range(60):
                response = client.get("/health", headers=headers)
                assert response.status_code == 200, f"Request {i+1} should succeed"

            # Next request from same forwarded IP should be blocked
            response = client.get("/health", headers=headers)
            assert response.status_code == 429

            # But request from different forwarded IP should work
            response = client.get("/health", headers={"X-Forwarded-For": "203.0.113.99"})
            assert response.status_code == 200

    def test_middleware_handles_x_real_ip(self):
        """Test that middleware respects X-Real-IP header."""
        # Enable trusted proxies for this test
        from learner_backend import main

        with patch.object(main, 'TRUSTED_PROXIES', '*'):
            client = TestClient(app)

            # Make requests with X-Real-IP header
            headers = {"X-Real-IP": "203.0.113.5"}

            # Make requests up to limit
            for _ in range(60):
                response = client.get("/health", headers=headers)
                assert response.status_code == 200

            # Next request from same real IP should be blocked
            response = client.get("/health", headers=headers)
            assert response.status_code == 429

    def test_middleware_prefers_x_forwarded_for_over_x_real_ip(self):
        """Test that X-Forwarded-For takes precedence over X-Real-IP."""
        # Enable trusted proxies for this test
        from learner_backend import main

        with patch.object(main, 'TRUSTED_PROXIES', '*'):
            client = TestClient(app)

            # Use both headers
            headers = {
                "X-Forwarded-For": "203.0.113.10",
                "X-Real-IP": "203.0.113.20",
            }

            # Make requests up to limit
            for _ in range(60):
                response = client.get("/health", headers=headers)
                assert response.status_code == 200

            # Rate limit should apply to X-Forwarded-For IP
            response = client.get("/health", headers=headers)
            assert response.status_code == 429

            # Request with only X-Real-IP (different IP) should still work
            response = client.get("/health", headers={"X-Real-IP": "203.0.113.20"})
            assert response.status_code == 200

    def test_middleware_ignores_proxy_headers_by_default(self):
        """Test that X-Forwarded-For and X-Real-IP headers are ignored by default.
        
        This is the core security fix: without TRUSTED_PROXIES configured,
        all requests should be rate-limited together using the actual client IP,
        preventing IP spoofing attacks.
        """
        from learner_backend import main

        # Ensure TRUSTED_PROXIES is not set (default behavior)
        with patch.object(main, 'TRUSTED_PROXIES', ''):
            client = TestClient(app)

            # Make requests with spoofed X-Forwarded-For headers
            # All should be rate-limited together since headers are ignored
            for i in range(60):
                # Use different "spoofed" IPs in each request
                headers = {"X-Forwarded-For": f"203.0.113.{i}"}
                response = client.get("/health", headers=headers)
                assert response.status_code == 200, f"Request {i+1} should succeed"

            # Next request with another "spoofed" IP should still be blocked
            # because all requests are from the same actual client IP
            response = client.get("/health", headers={"X-Forwarded-For": "203.0.113.99"})
            assert response.status_code == 429, "Should be rate-limited despite different X-Forwarded-For"

            # Same test with X-Real-IP header
            response = client.get("/health", headers={"X-Real-IP": "203.0.113.100"})
            assert response.status_code == 429, "Should be rate-limited despite X-Real-IP header"


class TestRateLimiterEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_rate_limiter_at_exact_boundary(self):
        """Test behavior at exactly 60 requests."""
        limiter = RateLimiter(requests_per_minute=60)
        client_ip = "192.168.1.1"

        # Make exactly 60 requests
        for i in range(60):
            result = limiter.is_allowed(client_ip)
            assert result is True, f"Request {i+1} should be allowed"

        # 61st request should be blocked
        assert limiter.is_allowed(client_ip) is False

    def test_rate_limiter_with_very_low_limit(self):
        """Test rate limiter with limit of 1 request per minute."""
        limiter = RateLimiter(requests_per_minute=1)
        client_ip = "192.168.1.1"

        # First request should be allowed
        assert limiter.is_allowed(client_ip) is True

        # Second request should be blocked
        assert limiter.is_allowed(client_ip) is False

    def test_rate_limiter_empty_ip_string(self):
        """Test rate limiter handles empty IP string."""
        limiter = RateLimiter(requests_per_minute=2)

        # Empty string should be treated as a valid key
        assert limiter.is_allowed("") is True
        assert limiter.is_allowed("") is True
        assert limiter.is_allowed("") is False

    def test_rate_limiter_special_characters_in_ip(self):
        """Test rate limiter handles IPs with special characters."""
        limiter = RateLimiter(requests_per_minute=2)

        # IPv6 addresses can contain colons
        ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
        assert limiter.is_allowed(ipv6) is True
        assert limiter.is_allowed(ipv6) is True
        assert limiter.is_allowed(ipv6) is False


class TestRateLimiterMaxClients:
    """Test max_clients LRU eviction behavior."""

    def test_max_clients_evicts_oldest_ips(self):
        """Test that when max_clients is exceeded, oldest IPs are evicted."""
        limiter = RateLimiter(requests_per_minute=10, max_clients=5)

        # Add 5 IPs (at the limit)
        for i in range(5):
            assert limiter.is_allowed(f"192.168.1.{i}") is True

        # All 5 should be tracked
        assert len(limiter.requests) == 5

        # Add a 6th IP, which should trigger LRU eviction of the oldest IP
        assert limiter.is_allowed("192.168.1.99") is True

        # Should still have only 5 IPs tracked
        assert len(limiter.requests) == 5

        # The oldest IP (192.168.1.0) should have been evicted
        assert "192.168.1.0" not in limiter.requests

        # The newest IP should be present
        assert "192.168.1.99" in limiter.requests

    def test_max_clients_eviction_immediate_regardless_of_cleanup_interval(self):
        """Test that eviction happens immediately when max_clients is exceeded, regardless of cleanup_interval."""
        limiter = RateLimiter(
            requests_per_minute=10, max_clients=3, cleanup_interval_seconds=1000
        )

        # Add 3 IPs (at the limit)
        for i in range(3):
            assert limiter.is_allowed(f"192.168.1.{i}") is True

        assert len(limiter.requests) == 3

        # Add a 4th IP - should trigger immediate cleanup despite long cleanup_interval
        assert limiter.is_allowed("192.168.1.99") is True

        # Should enforce the limit
        assert len(limiter.requests) <= 3

    def test_max_clients_active_ips_retained_over_inactive(self):
        """Test that active IPs that are accessed are retained over inactive ones during eviction."""
        limiter = RateLimiter(requests_per_minute=10, max_clients=3)
        base_time = time.time()

        # Add 3 IPs at base time
        with patch("time.time", return_value=base_time):
            for i in range(3):
                assert limiter.is_allowed(f"192.168.1.{i}") is True

        # Advance time by 61 seconds and access IP 1 and IP 2 to mark them as recently used
        future_time = base_time + 61
        with patch("time.time", return_value=future_time):
            # IP 0 becomes stale (no requests in last 60 seconds)
            # Access IP 1 and IP 2 to keep them active
            assert limiter.is_allowed("192.168.1.1") is True
            assert limiter.is_allowed("192.168.1.2") is True

            # Now add a 4th IP - stale IP 0 should be removed first
            assert limiter.is_allowed("192.168.1.99") is True

            # IP 0 should have been removed (stale)
            assert "192.168.1.0" not in limiter.requests

            # Active IPs should be retained
            assert "192.168.1.1" in limiter.requests
            assert "192.168.1.2" in limiter.requests
            assert "192.168.1.99" in limiter.requests

    def test_max_clients_with_all_active_clients(self):
        """Test behavior when all clients are active and max_clients is exceeded."""
        limiter = RateLimiter(requests_per_minute=10, max_clients=3)

        # Add 3 IPs, all active (all have recent requests)
        for i in range(3):
            assert limiter.is_allowed(f"192.168.1.{i}") is True

        assert len(limiter.requests) == 3

        # Add a 4th IP - should evict the oldest active IP
        assert limiter.is_allowed("192.168.1.99") is True

        # Should still be at or under the limit
        assert len(limiter.requests) <= 3

        # The oldest IP (192.168.1.0) should have been evicted
        assert "192.168.1.0" not in limiter.requests

        # The newest IP should be present
        assert "192.168.1.99" in limiter.requests
