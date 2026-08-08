## 2023-10-27 - Debouncing Route Prefetching
**Learning:** Attaching route prefetching logic directly to hover, focus, and touch events on numerous sidebar items causes rapid consecutive state checks (and potential network requests, although mostly deduplicated via state) which can block the main thread and impact frontend performance in React architectures with heavy component trees.
**Action:** Consolidate these rapid bursts of prefetch events by debouncing the calls using a shared/global timeout variable.
