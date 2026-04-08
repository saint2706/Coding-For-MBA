# Performance Audit (2026-03-10)

## Scope

- Production build artifact review (`vite build` output).
- Lighthouse CI runs against primary routes:
  - `/#/`
  - `/#/curriculum`
  - `/#/lesson/1`
  - `/#/progress`
  - `/#/search`

## Lighthouse summary (1 run per route)

| Route | Performance | Accessibility | SEO | FCP | LCP | TBT |
|---|---:|---:|---:|---:|---:|---:|
| `/#/` | 0.27 | 0.99 | 1.00 | 8.6s | 10.3s | 3140ms |
| `/#/curriculum` | 0.45 | 0.99 | 1.00 | 8.7s | 9.1s | 470ms |
| `/#/lesson/1` | 0.38 | 0.94 | 1.00 | 9.2s | 9.8s | 770ms |
| `/#/progress` | 0.48 | 0.88 | 1.00 | 8.7s | 9.0s | 360ms |
| `/#/search` | 0.55 | 0.99 | 1.00 | 8.8s | 9.1s | 150ms |

## Key findings

1. **Homepage main-thread blocking is the largest issue.**
   - Root route has very high total blocking time relative to other pages.
2. **Large JavaScript payload remains the dominant bottleneck.**
   - Build output still includes a large app entry chunk (`index-*.js`) and several heavy async content chunks.
3. **Search indexing work should not run at app boot.**
   - Proactive search indexing competes with initial paint and interaction work.

## Changes made in this audit

- Removed eager search-index preloading from app startup.
- Moved search indexing kickoff to the Search page mount lifecycle.

This keeps search warm-up behavior, but only when users actually visit search.

## Recommended next optimizations

1. **Split heavy route boot logic from Home route** to reduce root-route TBT.
2. **Load markdown/renderer dependencies on demand only** where rich content is needed.
3. **Defer non-critical third-party JS** (e.g., analytics/visual effects) until post-interaction.
4. **Reduce global CSS critical path** by splitting route-scoped styles and pruning unused selectors.
5. **Run Lighthouse with 3+ iterations and median reporting** for more stable regressions tracking.

## How to rerun

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
CHROME_PATH=/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome npx lhci collect --numberOfRuns=1 \
  --url=http://127.0.0.1:4173/Coding-For-MBA/#/ \
  --url=http://127.0.0.1:4173/Coding-For-MBA/#/curriculum \
  --url=http://127.0.0.1:4173/Coding-For-MBA/#/lesson/1 \
  --url=http://127.0.0.1:4173/Coding-For-MBA/#/progress \
  --url=http://127.0.0.1:4173/Coding-For-MBA/#/search \
  --settings.chromeFlags='--no-sandbox --disable-dev-shm-usage'
```

## Follow-up optimizations applied

- Deferred app store hydration (`progress`, `quiz`, `gamification`) to idle time in `App`.
- Removed route-transition motion wrappers from `App` runtime path.
- Lazy-loaded non-critical chrome components (`Sidebar`, `MobileNav`, keyboard shortcuts overlay, custom cursor`) so they no longer inflate the initial app chunk.
- Deferred expensive `totalHours` aggregation on Home to idle time, reducing synchronous render work.

## Follow-up results

- `dist/assets/index-*.js` dropped from ~590 kB to ~576 kB (gzip ~159.6 kB → ~155.9 kB) after component lazy-loading.
- Lighthouse single-run measurements continue to vary significantly under CI-like throttling; use multi-run median for reliable regression tracking.
