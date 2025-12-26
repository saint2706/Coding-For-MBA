
import time
from collections import deque, defaultdict
from typing import Dict

class RateLimiter:
    """
    A simple in-memory rate limiter using the sliding window log algorithm
    (approximated with fixed window or cleanup for simplicity).

    Actually, let's use a Token Bucket or Fixed Window Counter.
    Fixed Window is easiest: Reset count every minute.
    But Sliding Window Log is more accurate.

    Given the single-process nature, let's use a simple algorithm:
    Keep a list of timestamps for each IP. Clean up old timestamps on access.
    Check if count > limit.
    """

    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        # Dictionary mapping IP to a deque of timestamps
        self.requests: Dict[str, deque] = defaultdict(deque)

    def _cleanup(self):
        """Prune IP addresses that haven't made requests recently."""
        # Simple probabilistic cleanup or threshold-based
        if len(self.requests) > 1000:
            now = time.time()
            window_start = now - 60
            # Create a list of keys to remove to avoid runtime error during iteration
            keys_to_remove = []
            for ip, timestamps in self.requests.items():
                if not timestamps or timestamps[-1] < window_start:
                    keys_to_remove.append(ip)

            for ip in keys_to_remove:
                del self.requests[ip]

    def is_allowed(self, client_ip: str) -> bool:
        self._cleanup()
        """
        Check if the request from client_ip is allowed.
        """
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
