## 2024-05-18 - Caching DOM lookups in scroll events
**Learning:** `document.querySelector` inside scroll handlers can be expensive, causing layout thrashing or slowdowns during scrolling.
**Action:** Use `useRef` to cache the DOM element and verify presence with `.isConnected`, resetting it only when the selector prop changes.
