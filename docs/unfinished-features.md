# Unfinished Features

A consolidated, verified list of features that are planned but not yet implemented.
Compiled by cross-checking `docs/development-roadmap.md` and
`docs/markdown-renderer-roadmap.md` against the actual code, since those
roadmaps have drifted out of sync with reality in both directions (some
listed items already shipped, e.g. in-page lesson search, the sticky
mastery-check progress bar, and Playwright visual regression testing).
The codebase itself has no `TODO`/`FIXME`/stub markers in `src/` — all
open work lives at the roadmap level, not as in-code stubs.

Status legend: 🔲 not started · 🟡 partially implemented

## Platform & Learning Experience

- 🔲 **Table overflow fade indicator** — `TableComponent`'s horizontal
  scroll wrapper has no gradient/fade edge to signal that a wide table
  has more content off-screen. (`src/components/MarkdownRenderer.tsx`,
  `src/styles/`)
- 🔲 **Image captions via `<figcaption>`** — `ImageWithZoom` renders the
  `alt` text as an attribute only; there's no visible caption element
  below lesson images. No `figcaption` usage exists anywhere in `src/`.
- 🔲 **Offline / PWA support** — no service worker, no web app manifest,
  no `vite-plugin-pwa`/workbox integration. The app is currently
  online-only despite the "no setup required" pitch implying resilience
  to poor connectivity.
- 🔲 **Progress export/import** — there is no JSON download/upload flow
  for the `localStorage`-backed Zustand state (`progressStore`,
  `gamificationStore`, `masteryStore`, etc.). Switching devices currently
  loses all progress.
- 🔲 **WCAG 2.2 AA accessibility audit** — no audit has been run; the
  Lighthouse CI accessibility floor is still set low (0.8) and there's no
  record of a manual screen-reader pass.

## Content Authoring Tooling

- 🟡 **Content-authoring lint/safety net** — `scripts/validate-content.js`
  already validates that exercises have a goal and code block (via
  `extractExercisesFromContent` + `exerciseSchema`), but it does **not**
  validate that every `### Question N` mastery-check block has an
  accompanying `<details>` answer block. `scripts/content-schemas.js` has
  no schema coverage for mastery-check questions at all.

## Content & Curriculum

- 🔲 **Second elective/advanced track** — only the plan exists (e.g.
  "Agentic AI & MLOps" or "Cloud Data Platforms" as candidates); no
  elective track has been designed or shipped yet, nor has the first one
  referenced in the roadmap been started.
- 🔲 **Capstone projects per elective track** — depends on the elective
  tracks above; not started.
- 🔲 **Recurring content-freshness process** — a one-time audit is
  planned, but no recurring/calendar-driven freshness-check mechanism
  exists yet.

## Growth & Community

- 🔲 **Repo-specific content-authoring guide in `CONTRIBUTING.md`** —
  `CONTRIBUTING.md` links to `docs/todo.md` as the project roadmap, but
  that file does not exist in `docs/` (broken reference — the roadmap
  actually lives in `docs/development-roadmap.md`).
- 🔲 **Usage analytics** — no privacy-respecting/self-hosted analytics
  integration exists yet, so platform prioritization currently has no
  usage-data backing.
- 🔲 **Partnerships / localization pilot** — long-horizon Year 2 items,
  not started.

## Technical Health

- 🔲 **God-node refactors** — `useProgressStore`, `initializeContent()`,
  and `getAllPhases()` remain the highest-fan-in modules in the
  `graphify-out` knowledge graph (17-21 edges each); no targeted
  refactor has landed yet.
- 🔲 **Lighthouse performance floor raise** — CI still gates at a low
  0.45 performance floor; bundle-size/code-splitting work to raise it
  hasn't shipped.
- 🔲 **E2E coverage for Mermaid / SQL playground / mastery self-test** —
  these platform features (all otherwise complete, see
  `docs/markdown-renderer-roadmap.md`) still lack dedicated Playwright
  end-to-end tests.

## Notes

- Items already shipped despite being listed as open in
  `docs/development-roadmap.md`: in-page lesson search (`/`),
  sticky mastery-check progress bar, and Playwright visual regression
  testing (`tests/e2e/visual-regression.spec.ts`) — the roadmap should be
  updated to reflect this.
- `content/case-studies/*/starter.py` files intentionally contain
  `# TODO:` markers as student exercise scaffolding — these are
  pedagogical placeholders, not unfinished product features, and are
  excluded from this list.
