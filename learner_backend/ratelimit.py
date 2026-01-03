import time
from collections import deque, OrderedDict
from typing import Dict, Deque


class RateLimiter:
    """
    A simple in-memory rate limiter using the sliding window log algorithm.

    Tracks request timestamps per IP address and allows up to a specified
    number of requests per minute. This implementation is designed for
    single-process deployments only and is not thread-safe.

    Now uses OrderedDict to manage memory usage and limit the number of tracked clients.
    """

    def __init__(
        self,
        requests_per_minute: int = 60,
        cleanup_interval_seconds: float = 60.0,
        max_clients: int = 10000  # Prevent memory exhaustion (DoS)
    ):
        self.requests_per_minute = requests_per_minute
        # Dictionary mapping IP to a deque of timestamps.
        # OrderedDict allows us to efficiently remove the least recently active clients.
        self.requests: OrderedDict[str, Deque[float]] = OrderedDict()
        self._last_cleanup = time.time()
        self._cleanup_interval_seconds = cleanup_interval_seconds
        self.max_clients = max_clients

    def _cleanup(self):
        """Prune IP addresses that haven't made requests recently."""
        # Clean up stale entries from the "oldest" end of the OrderedDict.
        # We only check the oldest items until we find one that is still active.
        now = time.time()

        # Only run if enough time has passed, or if we are over the limit
        if (now - self._last_cleanup < self._cleanup_interval_seconds) and (len(self.requests) < self.max_clients):
            return

        self._last_cleanup = now
        window_start = now - 60

        # In an OrderedDict, the items at the beginning are the least recently inserted/updated
        # (if we move_to_end on access).
        # We iterate a copy of keys because we might modify the dict, but actually
        # we can just peek and pop.

        # Limit the number of items we check to avoid blocking for too long,
        # but always enforce the hard limit.

        # 1. Enforce Hard Limit (LRU eviction)
        while len(self.requests) > self.max_clients:
            self.requests.popitem(last=False) # Remove first (oldest) item

        # 2. Cleanup stale entries (Oldest first)
        # We peek at the start. If it's stale (no requests in window), remove it.
        # Stop as soon as we see an active one.
        keys_to_remove = []
        for ip, timestamps in self.requests.items():
            if not timestamps or timestamps[-1] < window_start:
                keys_to_remove.append(ip)
            else:
                # Since it's ordered by access time, if this one is active, subsequent ones likely are too.
                # However, timestamps[-1] is the *latest* request from that IP.
                # If we update order on access, then yes.
                break

        for ip in keys_to_remove:
            # Check existence because it might have been removed if we were multithreaded (though we aren't)
            if ip in self.requests:
                del self.requests[ip]

    def is_allowed(self, client_ip: str) -> bool:
        """
        Check if the request from client_ip is allowed.
        """
        self._cleanup()
        now = time.time()
        window_start = now - 60

        if client_ip in self.requests:
            user_requests = self.requests[client_ip]
            self.requests.move_to_end(client_ip) # Mark as recently used
        else:
            user_requests = deque()
            self.requests[client_ip] = user_requests
            # We don't move_to_end because it's already at end (newly inserted)

        # Remove requests older than the window
        while user_requests and user_requests[0] < window_start:
            user_requests.popleft()

        if len(user_requests) < self.requests_per_minute:
            user_requests.append(now)
            return True

        return False
