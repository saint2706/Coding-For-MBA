## 2024-05-14 - Scroll event performance

**Learning:** `document.querySelector` is executed on every scroll event in the `ScrollProgress` component (which is inside a requestAnimationFrame loop) if the target element isn't found immediately. DOM queries are slow and doing them repeatedly inside scroll/animation loops blocks the main thread.

**Action:** Caching the result of `document.querySelector` inside a `useRef` and verifying its presence with `document.body.contains(element)` drastically reduces the performance bottleneck of querying the DOM on every frame during scrolling.
