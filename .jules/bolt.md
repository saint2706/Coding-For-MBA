## 2024-08-21 - RequestAnimationFrame Optimization for Scroll Synchronization
**Learning:** High-frequency DOM events like `onScroll` can cause layout thrashing and unnecessary recalculations if synchronous updates directly access layout properties (`scrollTop`/`scrollLeft`) continuously.
**Action:** Use `requestAnimationFrame` to lock synchronous layout measurements and writes to the browser's refresh rate (typically 60Hz), combined with a `useRef` guard to drop redundant intermediate scroll updates during the same frame.
