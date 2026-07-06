## 2024-07-06 - [ScrollProgress DOM Caching]
**Learning:** The `ScrollProgress` component was querying the DOM via `document.querySelector` on every scroll event (requestAnimationFrame), causing unnecessary layout thrashing.
**Action:** Cache the queried DOM element in a local variable within the `useEffect` scope and verify its continued presence using `document.body.contains()` before recalculating bounds to reduce overhead.
