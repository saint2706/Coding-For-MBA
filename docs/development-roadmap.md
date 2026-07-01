# Coding for MBA: 2-Year Development Roadmap

**Horizon:** Q3 2026 – Q2 2028 · **Audience:** maintainer(s) and contributors · **Status:** living document, reviewed each quarter

## Starting point

As of mid-2026, the curriculum (12 phases, 145 days) is content-complete — every gap-analysis stub across all phases has been filled, and the markdown renderer has shipped most of its planned feature set (callouts, glossary tooltips, Mermaid diagrams, runnable Python/SQL blocks, diff/line-highlighted code, real mastery-check self-tests). The platform is a fully static, client-side React/TypeScript SPA: no backend, no accounts, progress lives in `localStorage` via Zustand stores. That zero-setup model is core to the project's value proposition ("free, self-paced, no setup required") and this roadmap does not change it — sync/portability problems are solved with export/import, not a server.

This is a solo-maintainer project. The roadmap is paced for one person working part-time: one pillar gets primary focus per quarter, with light maintenance on others, rather than parallel tracks.

## Pillars

Work is organized into four pillars. Each slips independently — a quarter running long doesn't invalidate the rest of the plan.

1. **Content & Curriculum** — the 145-day path itself: depth, breadth, freshness.
2. **Platform & Learning Experience** — the app learners actually use day to day.
3. **Technical Health** — the codebase's ability to keep absorbing #1 and #2 without rotting.
4. **Growth & Community** — discoverability, contribution pipeline, and external visibility.

## Non-goals (explicit)

- **No backend, accounts, or server-side sync.** Cross-device continuity is solved via local progress export/import, not infrastructure.
- **No paid tier or gating.** Stays fully open source, no subscriptions.
- **No rewrite of the curriculum's sequencing.** The 12-phase structure is settled; changes are additive (new elective tracks) not structural.

---

## Pillar 1 — Content & Curriculum

**Year 1 goal:** Keep the core 145 days fresh and add the first elective track for learners who finish the main path.
- Audit all 12 phases for library/API drift (e.g., pandas/sklearn/LLM API syntax) and fix stale examples — content correctness regresses silently as dependencies move.
- Design and ship one **elective/advanced track** (e.g., "Agentic AI & MLOps" or "Cloud Data Platforms" — pick based on which Phase 9-12 topics get the most learner engagement) as a clearly-marked optional branch off the main sequence, not a renumbering of existing days.
- ~~Add 3-5 new case studies (`content/case-studies/`) drawing on real, attributed business datasets, rotating out any that have gone stale.~~ **Done (2026-07):** added 5 case studies (11-15) built on real, cited public datasets — UCI Online Retail II, UCI Bank Marketing, NYC TLC taxi trip records, the ULB/Kaggle credit card fraud dataset, and World Bank macro indicators. Audited the original 10 (all synthetic-data-generator based) for staleness — no dead links or deprecated APIs found, so none were rotated out.

**Year 2 goal:** A second elective track plus a capstone structure.
- Ship a second elective track.
- Introduce **capstone projects**: 1-2 per elective track that combine multiple phases' skills into a portfolio-able deliverable, building on the existing `content/projects/` pattern.
- Establish a recurring **content freshness pass** (annual, calendar-reminder driven) rather than a one-time audit — this is the mechanism that keeps Year 1's freshness work from decaying again.

---

## Pillar 2 — Platform & Learning Experience

**Year 1 goal:** Close out the known UX backlog and add offline support.
- Finish the open items already tracked in `docs/markdown-renderer-roadmap.md`: in-page lesson search (`/` to search), sticky mastery-check progress bar, table overflow fade indicator, image captions via `figcaption`.
- Ship **offline/PWA support** (service worker + asset caching) — a natural extension of "no setup required" that lets learners on unreliable connections keep working; this is the single highest-leverage platform investment given the static-only constraint.
- Ship **progress export/import** (JSON download/upload of the `localStorage` Zustand state) — this is the concrete answer to "what if I switch devices" now that a backend is explicitly out of scope.

**Year 2 goal:** Accessibility hardening and content-authoring tooling.
- Run a full WCAG 2.2 AA accessibility audit and close gaps (current Lighthouse CI accessibility floor is 0.8 — raise the bar and add manual screen-reader passes, since automated scores don't catch everything).
- Build the **content-authoring safety net** lint rule already scoped in the renderer roadmap (validate every `### Exercise N` has a `**Goal**` + code block, every `### Question N` has a `<details>` block) — this directly de-risks the elective-track content work in Pillar 1.
- Revisit the spaced-repetition review system and achievement/gamification depth based on a year of real usage data from `useProgressStore`/`useGamificationStore`.

---

## Pillar 3 — Technical Health

**Year 1 goal:** Pay down structural debt before piling more content/features on top.
- Use the `graphify-out` knowledge graph to drive targeted refactors of the highest-fan-in "god nodes" (`useProgressStore` at 21 edges, `initializeContent()` and `getAllPhases()` at 17 edges each) — these are the modules most likely to become bottlenecks as Pillar 1/2 work lands on top of them. Refactor for clearer boundaries, not just smaller files.
- Raise the Lighthouse CI performance floor from its current **0.45** toward a realistic target (e.g. 0.75+) as bundle-size and code-splitting work lands — 0.45 is a low bar that was likely set to stop CI from blocking, not a target.
- Expand Playwright e2e coverage to the platform features shipped in the last two quarters (Mermaid, SQL playground, mastery-check self-test) that currently lack end-to-end tests, building on the existing 95 unit/component test files.

**Year 2 goal:** Make technical health self-sustaining.
- Re-run `graphify update .` as a standing habit after major refactors (already required by `CLAUDE.md`) and do a full `GRAPH_REPORT.md` architecture review once a year to catch new god-nodes/import cycles before they calcify.
- Add visual regression testing for the markdown renderer (Mermaid diagrams, KaTeX, code blocks) so future CSS/dependency bumps don't silently break lesson rendering.
- Tighten dependency hygiene: clear out the accumulated `overrides` block in `package.json` once upstream packages catch up, and keep Dependabot PRs current rather than batching them.

---

## Pillar 4 — Growth & Community

**Year 1 goal:** Make contribution easier and improve discoverability.
- Strengthen `CONTRIBUTING.md` with a content-authoring guide specific to this repo's lesson format (frontmatter schema, exercise/mastery-check conventions) — lowering the bar for community-submitted lessons matters more once elective tracks (Pillar 1) need contributors beyond the maintainer.
- Audit and tune the existing SEO pipeline (`scripts/generate-llms-txt.js`, `scripts/generate-sitemap.js`) against the Lighthouse CI SEO floor (currently 0.8) as new pages/tracks ship.
- Set up lightweight, privacy-respecting usage analytics (e.g. a self-hosted or no-cookie option) to give Pillar 1/2 prioritization something better than guesswork.

**Year 2 goal:** External visibility and partnerships.
- Pursue 1-2 partnerships or mentions with MBA programs/communities to validate the "business professionals learning to build" positioning.
- Pilot localization of the highest-traffic phase (likely Phase 1) to gauge demand before committing to full curriculum translation.
- Publish a trimmed, public-facing version of this roadmap's near-term section (next 1-2 quarters) linked from the README, so contributors and learners know what's coming — keep the full internal doc as the source of truth.

---

## Quarterly sequencing (primary focus per quarter)

| Quarter | Primary pillar | Focus |
|---|---|---|
| Q3 2026 | Technical Health | God-node refactors (`useProgressStore`, `initializeContent`, `getAllPhases`); raise Lighthouse perf floor |
| Q4 2026 | Platform & UX | Finish renderer-roadmap backlog (in-page search, progress bar, table/image polish); ship PWA/offline support |
| Q1 2027 | Content & Curriculum | Library/API drift audit across all 12 phases; design + ship first elective track |
| Q2 2027 | Growth & Community | Contribution guide, SEO/analytics tuning; **Year 1 retro** and roadmap refresh |
| Q3 2027 | Platform & UX | Progress export/import; accessibility audit (WCAG 2.2 AA); content-authoring lint rule |
| Q4 2027 | Content & Curriculum | Second elective track; capstone project structure |
| Q1 2028 | Technical Health | E2e coverage expansion; visual regression testing; dependency cleanup |
| Q2 2028 | Growth & Community | Partnerships, localization pilot; **Year 2 retro** and next-cycle planning |

## Success metrics

- **Content:** zero known stale/broken examples per freshness pass; at least 2 elective tracks live with completion data.
- **Platform:** Lighthouse performance ≥0.75, accessibility ≥0.9; PWA installable and usable offline for at least the active lesson.
- **Technical health:** no god-node above ~15 edges without a documented reason; e2e coverage on all interactive content types (Python, SQL, Mermaid, mastery checks).
- **Growth:** measurable increase in external contributions (PRs from non-maintainer authors) year-over-year.

## Review cadence

This document is reviewed and updated at the end of each quarter (aligned with the retros in Q2 2027 and Q2 2028 above), adjusting scope based on actual capacity rather than treating the dates as fixed deadlines.
