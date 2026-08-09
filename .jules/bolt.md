## 2023-10-27 - Optimize scroll handlers with requestAnimationFrame
**Learning:** High-frequency events like `onScroll` in React components (such as `CodePlayground` and `SqlPlayground`) can cause significant main-thread churn and layout thrashing if DOM properties like `scrollTop` are manipulated synchronously on every event fire.
**Action:** Always throttle high-frequency DOM manipulation inside event handlers (like scroll, mousemove) using `requestAnimationFrame` combined with a state/ref guard flag to lock execution to the display refresh rate.
