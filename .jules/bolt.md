## 2024-07-20 - Caching querySelector in ScrollProgress
**Learning:** `document.querySelector` inside a high-frequency event handler like scroll events can cause performance bottlenecks as it searches the DOM on every frame request.
**Action:** Always cache the results of `document.querySelector` in a `useRef` when used within high-frequency event handlers like scrolling, and ensure the ref is validated and updated appropriately if the target changes.
