import time
from collections import OrderedDict, deque
from typing import Deque


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
        max_clients: int = 10000,  # Prevent memory exhaustion (DoS)
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

        # Run cleanup if EITHER the interval has passed OR we're at/over the limit
        if (now - self._last_cleanup < self._cleanup_interval_seconds) and (
            len(self.requests) < self.max_clients
        ):
            return

        self._last_cleanup = now
        window_start = now - 60

        # 1. Cleanup stale entries first (those with no requests in the current window)
        # We iterate over all clients and remove those with no requests in the current window.
        keys_to_remove = []
        for ip, timestamps in self.requests.items():
            if not timestamps or timestamps[-1] < window_start:
                keys_to_remove.append(ip)

        for ip in keys_to_remove:
            del self.requests[ip]

        # 2. Enforce Hard Limit (LRU eviction) only if still needed after stale cleanup
        while len(self.requests) > self.max_clients:
            self.requests.popitem(last=False)  # Remove first (oldest) item

    def is_allowed(self, client_ip: str) -> bool:
        """
        Check if the request from client_ip is allowed.
        """
        self._cleanup()
        now = time.time()
        window_start = now - 60

        if client_ip in self.requests:
            user_requests = self.requests[client_ip]
            self.requests.move_to_end(client_ip)  # Mark as recently used
        else:
            user_requests = deque()
            self.requests[client_ip] = user_requests
            # Newly inserted items go to the end of OrderedDict

            # After adding new IP, enforce max_clients limit immediately if needed.
            # This complements the cleanup logic: cleanup runs periodically or when at limit,
            # but this ensures we never exceed max_clients even between cleanup cycles.
            if len(self.requests) > self.max_clients:
                # Remove oldest (first) entry. The newly added IP is at the end, so it won't be removed.
                self.requests.popitem(last=False)

        # Remove requests older than the window
        while user_requests and user_requests[0] < window_start:
            user_requests.popleft()

        if len(user_requests) < self.requests_per_minute:
            user_requests.append(now)
            return True

        return False
