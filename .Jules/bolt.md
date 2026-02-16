## 2026-02-13 - Search Index Initialization Jank
**Learning:** Initializing `Fuse.js` with 100+ markdown files (6KB each) causes ~200-400ms synchronous blocking on the main thread due to heavy regex processing (`stripMarkdown`).
**Action:** Use `requestIdleCallback` to preload expensive index creation during browser idle time, preventing jank on the first user interaction.

## 2026-02-13 - Eager Content Parsing
**Learning:** Eagerly parsing 100+ markdown files for exercises (using regex) and solution notebooks (using `JSON.parse`) at module scope blocks initial application load.
**Action:** Refactored `src/utils/contentLoader.ts` to lazy-load `allExercises` and `notebooks` only when accessed, deferring this work until the user navigates to the Exercises or Solutions pages.

## 2026-02-14 - D3 Selection in Loops
**Learning:** In `ConceptGraph.tsx`, re-selecting nodes via `d3.selectAll('.graph-node')` inside the edge iteration loop caused O(E*N) DOM queries, leading to significant lag during filtering.
**Action:** Pre-calculate node visibility into a `Set<number>` (O(N)) before iterating edges, allowing O(1) lookups and reducing complexity to O(N+E). Avoid DOM queries inside data-processing loops.
