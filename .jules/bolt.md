## 2025-02-09 - Caching querySelector in Scroll Handlers
**Learning:** In heavily re-rendered or fast-firing components like `ScrollProgress.tsx`, performing `document.querySelector` on every `requestAnimationFrame` interval or scroll event can introduce unnecessary main-thread overhead and GC thrashing.
**Action:** When implementing scroll listeners or requestAnimationFrame loops that depend on DOM lookups, cache the lookup result in a `useRef` and conditionally re-fetch only if the node becomes disconnected (`!element.isConnected`).
