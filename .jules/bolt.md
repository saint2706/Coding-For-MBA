- Wrapped `totalLessons` and `overallPct` calculations in `useMemo` blocks within `ProgressDashboard.tsx`, `Curriculum.tsx`, and `Home.tsx` to prevent unnecessary recalculation on every render.
- Replaced `getCompletedForPhase` usage inside `.map()` iterations across multiple views with a single memoized `Set` lookup (`completedSet`), converting repetitive `O(N * M)` array operations into constant-time `O(N)` lookups and significantly reducing memory allocation during render cycles.
- Optimized `ProgressDashboard.tsx`, `Curriculum.tsx`, and `PhaseOverview.tsx` by using memoized sets (`completedSet`) instead of the `isLessonComplete()` facade, converting O(N*M) array lookup iterations into efficient O(1) checks during render maps.

- Optimized `Lesson.tsx` handleToggleComplete method by converting the `afterCompleted` array into a `Set` before running `.every()` with `.has()`, effectively converting an O(N*M) time complexity bottleneck to O(M + N).
- Optimized `ProgressDashboard.tsx` earned badges rendering by replacing an O(N*M) `filter(...).includes(...)` operation with an O(N+M) `Set` lookup mechanism via `useMemo`.
- Implemented `getTotalReadingTime` caching in `contentLoader.ts` to avoid repetitive O(N) array reductions via `getAllLessons().reduce` coupled with expensive regex evaluation on every render in `Home.tsx` and `ContentStats.tsx`.
- Replaced `getAllPhases().some(...)` lookup in `Lesson.tsx` with an O(1) `!!getPhase(...)` check to avoid iterating over all phases during completion checks.
- Removed unnecessary optimization of `lessonMetrics.reduce` in `ContentStats.tsx` because `readingTime` is already pre-calculated in the array, making the global cache lookup an invalid regression.
- Correctly mocked `getTotalReadingTime` and `getPhase` in `Home.test.tsx` and `Lesson.test.tsx` respectively.
