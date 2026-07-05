## 2024-07-05 - Caching DOM queries in scroll handlers
**Learning:** `document.querySelector` inside a scroll event's `requestAnimationFrame` handler can cause performance degradation by forcing the browser to query the DOM on every scroll frame.
**Action:** Always cache the reference to the DOM element queried, and only re-query if the element no longer exists in the document.
