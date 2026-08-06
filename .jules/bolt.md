## 2023-10-27 - [Scroll Event Optimization]
**Learning:** React scroll event handlers that frequently query the DOM (e.g. `document.querySelector`) can cause significant performance overhead and main-thread layout thrashing if the result isn't cached.
**Action:** When implementing scroll-based UI (like a progress bar), always cache DOM queries in a `useRef`, ensure the element `isConnected` to avoid stale references, and reset the cache using a `useEffect` dependent on any selector props.
