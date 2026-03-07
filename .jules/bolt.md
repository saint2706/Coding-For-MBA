# Performance Log

## ⚡ Bolt Optimizations

- Extracted `react-markdown` components (`markdownComponents`) in `src/components/MarkdownRenderer.tsx` from an inline `useMemo` block to a static object outside the component scope to avoid recreating the component dictionary configuration object on every render cycle, slightly reducing render overhead.
- Extracted `TocItem` in `src/components/TableOfContents.tsx` and wrapped both the list items and the main `TableOfContents` container in `React.memo`. This optimization prevents O(N) re-renders of all Table of Contents links whenever the active heading ID changes on scroll, reducing main thread blocking time during scroll events and improving perceived scroll performance.
