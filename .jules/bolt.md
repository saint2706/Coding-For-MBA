## 2024-08-04 - Optimize ScrollProgress re-renders
**Learning:** Found an unnecessary DOM query inside the `ScrollProgress` component's scroll event listener that executes on every scroll event (via requestAnimationFrame). This caused performance issues by querying the DOM constantly during scrolling.
**Action:** Used `useRef` to cache the DOM element and verified `targetRef.current.isConnected` to ensure we don't hold on to stale elements if the DOM updates, which improves scroll performance significantly while maintaining correctness.
