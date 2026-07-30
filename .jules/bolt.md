## 2024-07-30 - Optimize route prefetch handlers
**Learning:** Attaching heavy event handlers (like route prefetching) to `onMouseEnter`, `onFocus`, or `onTouchStart` across hundreds of DOM elements simultaneously (e.g., links in a large Sidebar) can cause main-thread churn. Rapid bursts of events trigger consecutive immediate state or network deduplication checks.
**Action:** Consolidate rapid bursts of events by debouncing the calls using a shared/global timeout variable.
