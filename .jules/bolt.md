## 2026-07-21 - Cached DOM node lookup in scroll event
**Learning:** Repeatedly querying the DOM in scroll event listeners can cause significant performance bottlenecks due to main thread blocking.
**Action:** Use a `useRef` to cache the result of `document.querySelector`, ensuring to verify presence with `element.isConnected` and resetting the ref when the selector changes.
