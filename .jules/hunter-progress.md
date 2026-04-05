# Hunter Progress

## Session 1
- **Fixed:** Duplicated `dayToken` logic in `src/utils/dayToken.ts` and `scripts/day-token.js`. Consolidated into `src/utils/dayToken-core.js`.
- **Fixed:** Duplicated exercise extraction logic in `src/utils/contentLoader.ts` and `scripts/validate-content.js`. Consolidated into `src/utils/exercise-extractor-core.js`.
- **Verified:** Build, lint, and tests pass.

## Session 2
- **Fixed:** Duplicated frontmatter parsing logic in `scripts/frontmatter-parser.js` and `src/utils/frontmatter-core.js`. Consolidated into `src/utils/frontmatter-core.js`.
- **Fixed:** Updated `scripts/validate-content.js` and `scripts/generate-sitemap.js` to use the shared core parser.
- **Fixed:** Removed redundant `scripts/frontmatter-parser.js` and `scripts/frontmatter-parser.ts`.
- **Verified:** Build, lint, and tests pass. Scripts run correctly.

## Session 3
- **Fixed:** Removed duplicate import of `getReadingTime` in `src/pages/ContentStats.tsx`.
- **Fixed:** Removed duplicate import of `react` in `src/pages/Curriculum.tsx`.
- **Fixed:** Removed duplicate import of `react` in `src/components/__tests__/MarkdownRenderer.test.tsx`.
- **Fixed:** Removed duplicate import of `react` in `src/components/__tests__/ExerciseWidget.test.tsx`.
- **Fixed:** Removed duplicate import of `fuse.js` in `src/utils/searchIndex.ts`.
- **Fixed:** Removed duplicate import of `ReviewCard` in `src/pages/__tests__/Review.test.tsx`.
- **Verified:** Build, lint, and tests pass.

## Session 4
- **Fixed:** Changed React DOM property `fetchpriority` to `fetchPriority` in `src/components/MarkdownRenderer.tsx` which was causing console warnings in tests.
- **Fixed:** Removed leftover `// @ts-ignore` in `src/components/__tests__/ExerciseCard.test.tsx` and properly casted `undefined` to fix a type warning.
- **Verified:** Build, lint, and tests pass.

## Session 5
- **Fixed:** Removed leftover `// @ts-ignore` and updated typecasts in `src/utils/__tests__/confetti.test.ts`.
- **Fixed:** Removed leftover `// @ts-ignore` in `src/utils/__tests__/contentSchemas.test.ts`.
- **Fixed:** Removed leftover `eslint-disable-next-line @typescript-eslint/no-explicit-any` from `src/components/__tests__/ExerciseWidget.test.tsx` and `src/hooks/__tests__/usePyodide.test.tsx`.
- **Fixed:** Removed leftover `// eslint-disable-next-line no-control-regex` from `src/pages/NotebookViewer.tsx`.
- **Verified:** Build, lint, and tests pass.

## Session 6
- **Fixed:** Removed `as any` type casting in `src/components/MarkdownRenderer.tsx` and used appropriate type definition.
- **Fixed:** Removed `as any` type casting in `src/pages/Lesson.tsx` and imported `ParsedMasteryQuestion` type definition from `MarkdownRenderer.tsx`.
- **Fixed:** Replaced `// @ts-ignore` with `// @ts-expect-error` in `src/utils/__tests__/contentSchemas.test.ts`.
- **Verified:** Build, lint, and tests pass.

## Session 7
- **Fixed:** Removed leftover `as any` type casting in `src/pages/__tests__/ContentStats.test.tsx` by adding missing properties to the object.
- **Fixed:** Removed leftover `as any` type casting in `src/pages/__tests__/NotFound.test.tsx` by using an empty array.
- **Fixed:** Removed leftover `as any` type casting in `src/pages/__tests__/Curriculum.test.tsx` and correctly typed mock implementations.
- **Fixed:** Removed leftover `as any` type casting in `src/pages/__tests__/Exercises.test.tsx` by adding missing `starterCode`.
- **Fixed:** Removed leftover `as any` type casting in `src/pages/__tests__/PhaseOverview.test.tsx` by ensuring mocked objects returned complete structures.
- **Verified:** Build, lint, and tests pass.

## Session 8
- **Fixed:** Removed `as any` type casts from mock `Lesson` objects in `src/components/__tests__/PrerequisitePills.test.tsx` by fully populating the data.
- **Fixed:** Removed `as any` type casts from mock `Lesson` objects in `src/components/__tests__/RelatedLessons.test.tsx` by fully populating the data.
- **Fixed:** Removed `as any` type casts from mock module and return array in `src/components/__tests__/SidebarPhaseGroup.test.tsx` by properly typing mock and adding missing properties.
- **Fixed:** Replaced `as any` cast on mocked `IntersectionObserver` with `as unknown as typeof IntersectionObserver` in `src/components/__tests__/TableOfContents.test.tsx`.
- **Verified:** Build, lint, and tests pass.

## Session 9
- **Fixed:** Replaced `as any` cast on mock imports and `TouchEvent` in `src/components/__tests__/SearchPalette.test.tsx`, `src/components/__tests__/Sidebar.test.tsx`, `src/components/__tests__/AnimatedCounter.test.tsx`, and `src/hooks/__tests__/useSwipe.test.tsx`.
- **Fixed:** Used `Object.defineProperty` on the mocked `window` objects in `src/components/__tests__/BackToTop.test.tsx` instead of `as any`.
- **Verified:** Build, lint, and tests pass.

## Session 10
- **Fixed:** Removed leftover `as any` type casting in `src/utils/__tests__/searchIndex.perf.test.ts` by using `as unknown as typeof window.requestIdleCallback`.
- **Fixed:** Removed leftover `as any` type casting in `src/utils/__tests__/confetti.test.ts` by using `as unknown as { window?: Window }`.
- **Fixed:** Removed leftover `as any` type casting in `src/utils/__tests__/seoSchemas.test.ts` by using `as Record<string, unknown>[]` and `as Record<string, unknown>`.
- **Fixed:** Removed leftover `as any` type casting in `src/utils/__tests__/searchIndex.test.ts` by using `as unknown as typeof window.requestIdleCallback`.
- **Verified:** Build, lint, and tests pass.

## Session 11
- **Fixed:** Removed `as any` type casting in `src/pages/__tests__/SearchResults.test.tsx` by providing all necessary fields for the mocked `searchIndex.search` results.
- **Fixed:** Removed `as any` type casting in `src/pages/__tests__/Curriculum.test.tsx` by using `as unknown as contentLoader.Lesson`.
- **Fixed:** Removed `as any` type casting in `src/pages/__tests__/NotebookViewer.test.tsx` by using `as unknown as contentLoader.Phase` and `as unknown as contentLoader.Notebook`.
- **Fixed:** Removed `as any` type casting in `src/pages/__tests__/Exercises.test.tsx` by using `as unknown as contentLoader.Exercise[]` and `as unknown as contentLoader.Notebook`.
- **Fixed:** Removed `as any` type casting in `src/pages/__tests__/CaseStudies.test.tsx` by using `as unknown as contentLoader.CaseStudy[]` and `as unknown as contentLoader.Project[]`.
- **Fixed:** Removed `as any` type casting in `src/pages/__tests__/ProgressDashboard.test.tsx` by using proper `as unknown as Type` casts for `Phase[]`, `Lesson[]`, and `typeof useUserPreferencesStore`.
- **Verified:** Build, lint, and tests pass.

## Session 12
- **Fixed:** Replaced `as unknown as Lesson` cast with `as Lesson` and default fallback initializations in `src/utils/contentLoader.ts`.
- **Fixed:** Replaced `as unknown[]` cast with `as string[]` type assertion in `src/components/ConceptGraph.tsx`.
- **Verified:** Build, lint, and tests pass.

## Session 13
- **Fixed:** Replaced `as any` type casting with proper `Record<string, unknown>` and `unknown` types in `src/components/__tests__/ExerciseWidget.test.tsx` to improve type safety and fix strict type errors.
- **Fixed:** Replaced `as any` type casting with proper type structure in `src/components/__tests__/ExerciseCard.test.tsx` for `motion.div` mock.
- **Fixed:** Replaced `as any` type casting with proper type structure in `src/components/__tests__/AnimatedCounter.test.tsx` for `motion.animate` mock options.
- **Fixed:** Replaced `as any` type casting with proper type assertions in `src/components/__tests__/MarkdownRenderer.test.tsx` for syntax highlighter props mock.
- **Fixed:** Replaced `as any` type casting with proper type structure in `src/components/__tests__/ProgressBar.test.tsx` for `motion.div` mock and `root` handling.
- **Verified:** Build, lint, and tests pass.

## Session 14
- **Fixed:** Replaced `as any` type casting with proper type signature in `src/pages/__tests__/Home.test.tsx` for mocked Zustand selector.
- **Fixed:** Replaced `as any` type casting with proper type assertions in `src/pages/__tests__/Curriculum.test.tsx` for mocked `motion.div`, `root`, and mocked Zustand selector.
- **Fixed:** Replaced `any` variable typings in `src/hooks/__tests__/usePyodide.test.tsx` with `ReturnType<typeof usePyodide>`, appropriate Promise structures, and strict types.
- **Verified:** Build, lint, and tests pass.

## Session 15
- **Fixed:** Replaced `// @ts-expect-error` comments in `src/utils/__tests__/linkSafety.test.ts` with `as unknown as string` type assertions for invalid inputs.
- **Fixed:** Replaced `as any` cast on JS module import in `src/utils/__tests__/contentSchemas.test.ts` with `as unknown as { ... }` type assertion.
- **Verified:** Build, lint, and tests pass.
## Session 16
- **Fixed:** Removed leftover `as any` type casting in `src/utils/__tests__/slug.test.ts` by using `as unknown as React.ReactNode`.
- **Fixed:** Removed leftover `as any` type casting in `src/utils/__tests__/dayToken.test.ts` by using `as unknown as string`.
- **Fixed:** Removed leftover `as any` type casting for `root` variable in `src/pages/__tests__/ContentStats.test.tsx`, `src/pages/__tests__/NotFound.test.tsx`, and `src/pages/__tests__/PhaseOverview.test.tsx` by typing it correctly as `ReturnType<typeof createRoot> | null`.
- **Verified:** Build, lint, and tests pass.
## Session 17
- **Fixed:** Removed `as any` type casting in `src/utils/__tests__/contentSchemas.test.ts` by adding proper interface types for the destructured variables.
- **Verified:** Build, lint, and tests pass.

## Session 18
- **Fixed:** Replaced `as any` type casting with proper type assertions (`as unknown as ReturnType<typeof ...getState>` and `import('zustand/middleware').StorageValue<unknown>`) in `src/stores/__tests__/userPreferencesStore.test.ts`, `src/stores/__tests__/gamificationStore.test.ts`, `src/stores/__tests__/learningAnalyticsStore.test.ts`, and `src/stores/__tests__/progressStore.test.ts`.
- **Verified:** Build, lint, and tests pass.

## Session 19
- **Fixed:** Replaced `any` type casting with proper type assertions `(selector: (state: { completedLessons: string[] }) => unknown)` for `useProgressStore` selector mock in `src/pages/__tests__/Lesson.test.tsx`.
- **Fixed:** Replaced `any` type casting with proper props types for component mocks (`MarkdownRenderer` with `{ content: string }`, `CodePlayground` with `{ initialCode: string }`) in `src/pages/__tests__/NotebookViewer.test.tsx`.
- **Fixed:** Replaced `any` type casting with proper props type `{ value: number; suffix?: string }` for `AnimatedCounter` mock in `src/pages/__tests__/ContentStats.test.tsx`.
- **Fixed:** Replaced `any` type casting with proper props types for component mocks (`MarkdownRenderer` with `{ content: string }`, `motion.div` with `React.ComponentProps<'div'>`) in `src/pages/__tests__/CaseStudies.test.tsx`.
- **Verified:** Build, lint, and tests pass.

## Session 20
- **Fixed:** Removed `// @ts-expect-error` and `as unknown` type casting in `src/utils/__tests__/contentSchemas.test.ts` by creating `scripts/content-schemas.d.ts` and correctly typing Zod schema imports.
- **Fixed:** Removed `as unknown` type casting in `src/components/__tests__/SidebarPhaseGroup.test.tsx` by providing completely mocked `Lesson` objects.
- **Fixed:** Removed `as unknown` type casting in `src/components/__tests__/ExerciseCard.test.tsx` by properly omitting the mocked `goal` string property.
- **Fixed:** Removed `as unknown` type casting in `src/components/__tests__/MobileNav.test.tsx` by explicitly importing and using the `Location` type for `useLocation` mock returns.
- **Verified:** Build, lint, and tests pass.

## Session 21
- **Fixed:** Replaced `as unknown as string` type assertions in `src/utils/__tests__/dayToken.test.ts` and `src/utils/__tests__/linkSafety.test.ts` with `// @ts-expect-error` to properly test invalid inputs.
- **Fixed:** Replaced `as unknown as React.ReactNode` type assertion in `src/utils/__tests__/slug.test.ts` with `// @ts-expect-error` to properly test invalid objects.
- **Fixed:** Corrected casing of `fetchpriority` to `fetchPriority` on `<img />` elements in `src/components/MarkdownRenderer.tsx` to fix React DOM warnings in tests.
- **Verified:** Build, lint, and tests pass.

## Session 22
- **Fixed:** Replaced `as any` type casts and loosely typed mocks with explicit types and proper assertions in `src/pages/__tests__/Exercises.test.tsx` (for `ExerciseCard`, `motion.div`, and `useQuizStore`).
- **Fixed:** Replaced `as any` type casts and loosely typed mocks with explicit types and proper assertions in `src/pages/__tests__/PhaseOverview.test.tsx` (for `motion.div` and `useProgressStore`).
- **Verified:** Build, lint, and tests pass.

## Session 23
- **Fixed:** Resolved CI formatting pipeline failure (`npm run format:check`) by running `npm run format` locally using Prettier to properly align the strict TypeScript definitions introduced in the test files (`src/pages/__tests__/Exercises.test.tsx` and `src/pages/__tests__/PhaseOverview.test.tsx`).
- **Verified:** `npm run format:check`, lint, tests, and build pass successfully without errors.

## Session 24
- **Fixed:** Resolved `TypeError: activeLink.scrollIntoView is not a function` in `src/components/__tests__/SidebarPerf.test.tsx` by globally mocking `window.HTMLElement.prototype.scrollIntoView = vi.fn()` within the `src/test/setup.ts` JSDOM environment config.
- **Verified:** Build, lint, and tests pass successfully without unhandled exceptions.

## Session 25
- **Fixed:** Removed `any` type in `src/components/__tests__/SidebarPerf.test.tsx` by updating Zustand store mock typing.
- **Fixed:** Removed `any` type in `src/components/__tests__/Sidebar.test.tsx` by updating Zustand store mock typing.
- **Fixed:** Removed `any` type in `src/hooks/__tests__/useLearningAnalytics.test.tsx` by updating mock state type to `Partial<ReturnType<typeof useLearningAnalyticsStore.getState>>`.
- **Fixed:** Removed `any` type in `src/utils/rehype-slug-custom.ts` by correctly casting the recursive node element.
- **Verified:** Build, lint, and tests pass successfully without unhandled exceptions.
