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
