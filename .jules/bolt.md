## 2023-10-27 - [Scroll Event Layout Thrashing]
**Learning:** High-frequency DOM queries like `document.querySelector` inside `requestAnimationFrame` loops on scroll events can cause layout thrashing and high CPU usage in React applications.
**Action:** Always cache the result of `document.querySelector` using a `useRef` to prevent querying the DOM on every frame. Ensure to clear the ref when the target selector changes.
