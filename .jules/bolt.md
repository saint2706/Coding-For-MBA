## 2025-05-23 - Optimize syntax highlighting bundle size

**Learning:** `react-syntax-highlighter` default import includes all languages, resulting in a large bundle. Using `PrismLight` with explicit language registration significantly reduces size.
**Action:** Always prefer `PrismLight` or `Light` builds for syntax highlighting libraries and register only needed languages.

## 2025-05-23 - Zustand Infinite Loop with Selectors

**Learning:** Zustand selectors that return new object references on every call (e.g., deriving state into a new object) can cause infinite re-render loops in React components when used with `useQuizStore(selector)`, because `useSyncExternalStore` detects a change every time.
**Action:** Use `useShallow` from `zustand/react/shallow` to wrap selectors that return objects, or ensure selectors are memoized/stable.

## 2025-05-23 - Repeated Array Filtering in Content Loader

**Learning:** `getLessonsByPhase` was filtering the full lesson array (O(N)) on every call. In the Sidebar, this resulted in O(P*N) complexity.
**Action:** Implemented a lazy, cached index to group lessons by phase once (O(N)), reducing subsequent lookups to O(1).

## 2025-05-23 - Chunked Search Indexing and Robustness

**Learning:** Heavy synchronous operations like full-text search indexing (Fuse.js) block the main thread, causing UI freezes. Lazy loading with chunked execution via `requestIdleCallback` improves responsiveness, but requires a synchronous fallback (force-finish) to guarantee correctness if the user interacts immediately.
**Action:** Implement chunked processing for expensive initializations and always include defensive checks for optional fields (e.g., `lesson.title`) to prevent crashes during large batch operations.
