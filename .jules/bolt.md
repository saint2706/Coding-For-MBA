## 2024-08-05 - Optimize ScrollProgress element selection
**Learning:** The ScrollProgress component repeatedly calls `document.querySelector` inside a scroll event handler (`updateProgress` via `requestAnimationFrame`), which creates unnecessary DOM queries on every scroll tick.
**Action:** Cache the queried element in a `useRef`, verifying it with `isConnected` to handle DOM unmounts, and resetting the ref when the `targetSelector` prop changes.
