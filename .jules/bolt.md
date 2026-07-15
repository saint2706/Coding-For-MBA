## 2023-11-20 - Optimizing Event Listeners in Route Prefetching

**Learning:** Route prefetching in this app attached multiple `prefetchRoute` calls to mouse/focus events per link. Because this is executed extensively in components like `Sidebar` with hundreds of links, the continuous immediate firing of these event handlers created noticeable main-thread overhead as the user naturally scrolled and hovered over lists of links. We were needlessly invoking the deduplication check many times per second.

**Action:** Debounced the `prefetchRoute` call in `createRoutePrefetchHandlers` utilizing a shared timeout. Because users trigger multiple events (`onMouseEnter`, `onFocus`) almost simultaneously, debouncing with a single global 50ms delay consolidates rapid bursts of calls into a single prefetch attempt, significantly reducing call stack overhead without losing the benefits of preloading.
