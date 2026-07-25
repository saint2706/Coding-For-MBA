## 2025-07-25 - [ScrollProgress Component Optimization]
**Learning:** Avoid repetitive DOM queries inside high-frequency scroll event handlers, even when using requestAnimationFrame. Caching the target element result using a React ref and checking `element.isConnected` reduces main-thread work significantly during scroll.
**Action:** Always cache `document.querySelector` results in a `useRef` when used inside scroll handlers. Ensure the ref is reset in a `useEffect` dependent on the target selector prop.
