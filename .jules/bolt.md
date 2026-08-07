## 2024-10-31 - Scroll Event Ref Caching
**Learning:** High-frequency event listeners (like scroll) in React components can severely impact performance if they execute DOM queries (e.g., `document.querySelector`) on every tick.
**Action:** Always cache DOM elements accessed during scroll events using `useRef` and ensure you invalidate the cache correctly when the component or selector changes. Validate the cache using `element.isConnected` to prevent stale reference bugs.
