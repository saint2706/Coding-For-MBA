## 2024-07-26 - [Scroll Event Optimization]
**Learning:** React `useEffect` hooks that query the DOM inside scroll event handlers can cause massive performance issues, as they evaluate `document.querySelector` on every scroll tick.
**Action:** Use `useRef` to cache the DOM element reference instead of querying the DOM on every scroll event tick, keeping the main thread free. Make sure to reset the ref in a `useEffect` dependant on the target selector prop, in case the target changes. Check the element is connected to the DOM using `element.isConnected` to avoid stale references.
