## 2025-02-23 - Lazy Initialization Performance
**Learning:** Lazy initialization (like `Fuse.js` index building) saves startup time but can cause jank on the first interaction.
**Action:** Use `requestIdleCallback` to preload expensive lazy resources during browser idle time, getting the best of both worlds (fast startup + fast interaction).
