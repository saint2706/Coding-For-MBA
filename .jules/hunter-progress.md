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
