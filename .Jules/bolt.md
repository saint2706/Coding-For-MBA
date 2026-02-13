## 2026-02-13 - Search Index Initialization Jank
**Learning:** Initializing `Fuse.js` with 100+ markdown files (6KB each) causes ~200-400ms synchronous blocking on the main thread due to heavy regex processing (`stripMarkdown`).
**Action:** Use `requestIdleCallback` to preload expensive index creation during browser idle time, preventing jank on the first user interaction.
