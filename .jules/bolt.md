## 2025-02-09 - [ScrollProgress Component Refactor]
**Learning:** Refactoring the `ScrollProgress` component to reduce `document.querySelector` calls across scroll events significantly reduces Main Thread utilization without sacrificing functionality.
**Action:** Store references to DOM nodes with `useRef` to prevent redundant lookups.
