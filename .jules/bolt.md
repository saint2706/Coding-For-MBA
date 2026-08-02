## 2024-08-02 - React Scroll Event Performance
**Learning:** Calling `document.querySelector` inside a high-frequency scroll event handler is a significant performance bottleneck. React components can cache DOM lookups using `useRef` to prevent expensive queries on every scroll tick.
**Action:** Always check high-frequency event handlers (like scroll, mousemove) for DOM queries and cache them where possible, taking care to handle element unmounting or prop changes (like targetSelector) that require cache invalidation.
