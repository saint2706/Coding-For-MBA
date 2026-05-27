## Testing Improvements

- Replaced `setTimeout` with fake timers (`vi.useFakeTimers`, `vi.advanceTimersByTime`, etc) in `ExerciseWidget.test.tsx` and `usePyodide.test.tsx` and `prefetchRoutes.test.ts` and `searchIndex.perf.test.ts` and `searchIndex.test.ts`.
- Ensured teardowns use `vi.useRealTimers()` in `afterEach` blocks instead of trailing inside `it` blocks to avoid test pollution upon failure.

Overall test latency improved slightly and test suite reliability increased by eliminating race condition flakiness.

Coverage remains strong across components and utils.
