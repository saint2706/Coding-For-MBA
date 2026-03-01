# Performance Log

## ⚡ Bolt Optimizations

- Extracted `react-markdown` components (`markdownComponents`) in `src/components/MarkdownRenderer.tsx` from an inline `useMemo` block to a static object outside the component scope to avoid recreating the component dictionary configuration object on every render cycle, slightly reducing render overhead.
