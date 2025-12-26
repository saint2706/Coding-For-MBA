import time
from collections import defaultdict, deque
from typing import Dict


class RateLimiter:
    """
    A simple in-memory rate limiter using the sliding window log algorithm.

    Tracks request timestamps per IP address and allows up to a specified
    number of requests per minute. This implementation is designed for
    single-process deployments only and is not thread-safe.

    For multi-process or multi-threaded environments, consider using a
    distributed rate limiter (Redis, Memcached) or protecting data
    structures with locks.
    """

    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        # Dictionary mapping IP to a deque of timestamps
        self.requests: Dict[str, deque] = defaultdict(deque)
        # Track when we last performed a global cleanup, and how often to do it
        self._last_cleanup = time.time()
        self._cleanup_interval_seconds = 60.0

    def _cleanup(self):
        """Prune IP addresses that haven't made requests recently."""
        # Perform cleanup at most once per configured interval to avoid
        # scanning all IPs on every request while still removing stale entries.
        now = time.time()
        if now - self._last_cleanup < self._cleanup_interval_seconds:
            return

        self._last_cleanup = now
        window_start = now - 60
        # Create a list of keys to remove to avoid runtime error during iteration
        keys_to_remove = []
        for ip, timestamps in self.requests.items():
            if not timestamps or timestamps[-1] < window_start:
                keys_to_remove.append(ip)

        for ip in keys_to_remove:
            del self.requests[ip]

    def is_allowed(self, client_ip: str) -> bool:
        """
        Check if the request from client_ip is allowed.
        """
        self._cleanup()
        now = time.time()
        window_start = now - 60

        user_requests = self.requests[client_ip]

        # Remove requests older than the window
        while user_requests and user_requests[0] < window_start:
            user_requests.popleft()

        if len(user_requests) < self.requests_per_minute:
            user_requests.append(now)
            return True

        return False
