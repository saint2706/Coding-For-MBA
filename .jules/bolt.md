# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2025-02-12 - [React Performance] - Inline Objects and Memoization
**Learning:** Inline object definitions (e.g., `components={{ ... }}`) inside a `React.memo` wrapped component defeat memoization because the object reference changes on every render, causing the component to re-render unnecessarily even if props haven't changed.
**Action:** Extract static or stable configuration objects (like `markdownComponents`, `remarkPlugins`, `rehypePlugins`) outside the component or use `useMemo` to ensure stable references before passing them to memoized components.
