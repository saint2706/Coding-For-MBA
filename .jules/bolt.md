## 2024-07-11 - Cache document.querySelector for ScrollProgress
**Learning:** `ScrollProgress.tsx` queries the DOM using `document.querySelector` inside a `requestAnimationFrame` handler during scrolling, which causes DOM layouts to thrash continuously.
**Action:** Always cache the reference using `useRef`, ensure to check if `element.isConnected` is still valid, and reset the cache when the target selector prop changes.
