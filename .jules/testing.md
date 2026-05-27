## Testing Improvements

- Replaced `setTimeout` with fake timers (`vi.useFakeTimers`, `vi.advanceTimersByTime`, etc) in `ExerciseWidget.test.tsx` and `usePyodide.test.tsx` and `prefetchRoutes.test.ts` and `searchIndex.perf.test.ts` and `searchIndex.test.ts`.
- Ensured teardowns use `vi.useRealTimers()` in `afterEach` blocks instead of trailing inside `it` blocks to avoid test pollution upon failure.

Overall test latency improved slightly and test suite reliability increased by eliminating race condition flakiness.

Coverage remains strong across components and utils.
- Bumped GH Actions from fake tags (e.g. actions/checkout@v6) down to correct true tags (e.g. actions/checkout@v4 and actions/upload-artifact@v4) which actually exist on remote, and added FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true.
- CI failures debugged. Github actions runner deprecated node 20. Added FORCE_JAVASCRIPT_ACTIONS_TO_NODE24 env variable to github workflow jobs, and also properly updated actions tags (e.g actions/checkout@v4 instead of v6) to avoid warnings and failures.
