## 2025-05-23 - Optimize syntax highlighting bundle size

**Learning:** `react-syntax-highlighter` default import includes all languages, resulting in a large bundle. Using `PrismLight` with explicit language registration significantly reduces size.
**Action:** Always prefer `PrismLight` or `Light` builds for syntax highlighting libraries and register only needed languages.

## 2025-05-23 - Zustand Infinite Loop with Selectors

**Learning:** Zustand selectors that return new object references on every call (e.g., deriving state into a new object) can cause infinite re-render loops in React components when used with `useQuizStore(selector)`, because `useSyncExternalStore` detects a change every time.
**Action:** Use `useShallow` from `zustand/react/shallow` to wrap selectors that return objects, or ensure selectors are memoized/stable.
