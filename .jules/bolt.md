## 2024-08-15 - Caching document.querySelector in React Event Handlers
**Learning:** React scroll handlers that query the DOM directly on every animation frame (e.g., `document.querySelector`) are a significant bottleneck, causing layout thrashing and reduced FPS.
**Action:** Always cache the result of `document.querySelector` using a `useRef` when needed inside high-frequency event handlers like scroll. Ensure to reset the ref cache via a `useEffect` if the selector string changes, and verify node existence with `.isConnected`.
