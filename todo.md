# Design System — Coding for MBA

This document tracks design token extraction, component changes, build notes, and remaining enhancements inferred from the `stitch-designs/` HTML prototypes.

---

## Design Tokens Extracted

Tokens were extracted from `stitch-designs/html/*.html` and reconciled with the existing CSS variable system in `src/styles/variables.css` and `src/styles/ux-features.css`.

### Color Palette

| Token | Dark Mode | Light Mode | Notes |
|---|---|---|---|
| `--bg-primary` | `#102022` | `#f5f8f8` | Dark: updated to match stitch `background-dark` |
| `--bg-secondary` | `#0f2023` | `#edf2f2` | Dark: updated to match stitch lesson bg |
| `--bg-card` | `#162a2d` | `#ffffff` | Matches stitch `surface-dark` |
| `--bg-card-hover` | `#1d363a` | `#f0f6f6` | Updated to stitch `card-hover` |
| `--accent-primary` | `#08b5d4` | `#08b5d4` | Stitch `primary` — unchanged (already matched) |
| `--accent-secondary` | `#0694ad` | `#0694ad` | Stitch `primary-dark` |
| `--accent-tertiary` | `#22d3ee` | `#0694ad` | Cyan highlight / link color |
| `--border-subtle` | `rgba(176,191,219,0.12)` | `rgba(8,40,50,0.10)` | Light updated to teal-tint |
| `--border-card` | `rgba(176,191,219,0.18)` | `rgba(8,40,50,0.14)` | Light updated |
| `--border-active` | `rgba(8,181,212,0.4)` | `rgba(8,181,212,0.5)` | Accent border |

### Light Mode Text

| Token | Value | Notes |
|---|---|---|
| `--text-primary` | `#1a2e30` | Teal-tinted dark slate (stitch slate-900 area) |
| `--text-secondary` | `#374f52` | Stitch slate-600 equivalent |
| `--text-muted` | `#637e82` | Stitch slate-400 equivalent |
| `--text-heading` | `#0d2224` | Near-black teal-tinted heading |

### Typography System

| Token | Value |
|---|---|
| `--font-body` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace` |
| Base size | `1rem` (scalable via `--app-font-size`) |
| Heading scale | `clamp(2rem, 5vw, 3.25rem)` for h1; scales down through h6 |

### Spacing Scale

| Token | Value |
|---|---|
| `--radius-sm` | `6px` |
| `--radius-md` | `10px` |
| `--radius-lg` | `16px` |
| `--radius-xl` | `24px` |
| `--page-padding` | `2rem` |
| `--sidebar-width` | `300px` |
| `--navbar-height` | `64px` |
| `--content-max-width` | `900px` |

### Shadows

| Token | Dark | Light |
|---|---|---|
| `--shadow-card` | `0 4px 24px rgba(0,0,0,0.3)` | `0 1px 3px rgba(0,0,0,0.06)` |
| `--shadow-elevated` | `0 8px 40px rgba(0,0,0,0.4)` | `0 4px 16px rgba(0,0,0,0.08)` |
| `--shadow-glow` | `0 0 40px rgba(8,181,212,0.15)` | `0 0 20px rgba(8,181,212,0.08)` |

---

## Components Created / Modified

### New Components

| Component | Path | Description |
|---|---|---|
| `AiDashboard` | `src/pages/AiDashboard.tsx` | AI feature hub page accessible via `/ai` route. Shows AI capabilities, quick-start lessons, and CTA to continue learning with AI. |

### Modified Components

| Component | Change |
|---|---|
| `Navbar` | Added **✨ AI Study** link pointing to `/ai` for desktop discoverability |
| `MobileNav` | Added **AI** tab with robot icon pointing to `/ai` for mobile discoverability |
| `App.tsx` | Added `/ai` lazy route for `AiDashboard` |
| `prefetchRoutes.ts` | Registered `/ai` route for predictive prefetching |
| `vite.config.ts` | Added `AiDashboard` to `ai-assistant` chunk for efficient code splitting |

---

## Build Changes

### API Key Validation (Phase 4)

The Gemini API key is **correctly handled server-side**:
- `GEMINI_API_KEY` is used only in `api/gemini/_shared.js` (Vite middleware / server)
- The frontend **never** accesses `VITE_GEMINI_API_KEY` directly
- `import.meta.env` is only used for optional tuning constants (`VITE_GEMINI_TIMEOUT_MS`, `VITE_GEMINI_MAX_RETRIES`, `VITE_GEMINI_RETRY_BASE_DELAY_MS`, `VITE_GEMINI_API_BASE`)
- GitHub Actions deployment does not expose API secrets via the build output

No changes required for Phase 4.

### Critical CSS Update (index.html)

Updated the inline critical CSS in `index.html`:
- `background`: `#f8fafc` → `#0d1517` (aligns with dark-first stitch design)
- Hero gradient: `rgba(99,102,241,...)` (legacy indigo) → `rgba(8,181,212,...)` (stitch cyan)
- `theme-color` meta: `#6366f1` → `#08b5d4`

---

## AI Flow Improvements (Phase 3)

### Before
- AI Study Assistant was accessible **only inside lesson pages** via a floating FAB button
- No navigation entry point in Navbar or MobileNav
- Users had no way to discover AI features without opening a lesson first

### After
- **Navbar**: `✨ AI Study` link visible in desktop navigation
- **MobileNav**: `AI` tab added as 5th item in the bottom bar
- **AiDashboard page** (`/ai`): Standalone hub explaining all 6 AI features, providing quick-start lesson cards, and displaying curriculum stats
- **Continue with AI CTA**: Dashboard auto-detects last visited lesson and shows a personalized CTA

---

## Responsive Implementation Notes (Phase 5)

The existing `src/styles/responsive.css` already implements:
- Mobile-first sidebar collapse at `≤1024px`
- Navbar links hidden on mobile (sidebar provides same navigation)
- Touch-friendly 44px minimum touch targets on day links
- Stack to single column at `≤640px`

The new `AiDashboard` uses CSS Grid with `auto-fill / minmax()` which naturally stacks on mobile.
The new MobileNav item respects the existing `.mobile-nav-item` class for consistent touch sizing.

---

## Remaining Enhancements

- [x] Add Material Symbols icon font for richer iconography (as used in stitch designs)
- [x] Implement hero "continue learning" card with floating glassmorphism cards (stitch landing_page.html)
- [x] Add stats grid (140 days / 12 phases / 25+ projects / 5k+ peers) to Home hero
- [x] Implement stitch sidebar design variant with streak badge and phase accordion
- [x] Add glassmorphism card style to phase cards on Curriculum page
- [x] Add AI availability status badge (live/unavailable) to Navbar AI link
- [x] Add per-lesson AI usage history widget to AiDashboard
- [x] Implement curriculum roadmap view (stitch `curriculum_roadmap.html`)
- [x] Explore Mobile Dashboard redesign (stitch `mobile_dashboard.html`) for ProgressDashboard page

---

## Dependency Audit — 2026-03-01

### `@google/generative-ai` — Not needed

The `@google/generative-ai` SDK is **not installed and not referenced** anywhere in this codebase.
The Gemini integration in `src/utils/geminiClient.ts` and `api/gemini/_shared.js` calls the
Gemini REST API directly via `fetch()`, using either a backend proxy (`VITE_GEMINI_API_BASE`) or
direct browser requests with `VITE_GEMINI_API_KEY`. The SDK adds ~250 KB to the bundle with no
benefit over the existing custom fetch wrapper. **Do not add it.**

### `npm audit` — 0 vulnerabilities

All production and dev dependencies are clean as of this audit date.

### Outdated packages (patch-level, non-breaking)

| Package | Installed | Latest | Priority |
|---|---|---|---|
| `@types/node` | 25.3.1 | 25.3.3 | low — type-only |
| `lint-staged` | 16.2.7 | 16.3.0 | low — dev-only |
| `react-syntax-highlighter` | 16.1.0 | 16.1.1 | low — patch fix |

These will be auto-updated by the Dependabot weekly run (Thursdays 13:00 IST).

---

## Recommended New Packages — Features to Unlock

### 1. `idb` ^8.x — IndexedDB wrapper (semantic-search cache)

**What it unlocks:** The semantic search embedding cache (`src/utils/semanticSearch.ts`) currently
stores all lesson embeddings in `localStorage`, which is capped at ~5 MB and is synchronous
(blocks the main thread on reads/writes). `idb` wraps the IndexedDB API with a Promise-based
interface, providing async, non-blocking storage with a limit of 50–250 MB — enough for the full
curriculum embedding corpus and offline-first reading.

**Install:** `npm install idb`

### 2. `dexie` ^4.x — IndexedDB ORM (alternative to `idb`)

**What it unlocks:** Same as `idb` but with a higher-level ORM query API. Easier to extend for
caching lesson markdown content for full offline-mode support (PWA upgrade path).

**Install:** `npm install dexie`

### 3. `date-fns` ^4.x — Lightweight date utilities

**What it unlocks:** The learning analytics store, review scheduler, and progress tracker all do
manual date arithmetic (ms-level epoch math, `toLocaleDateString`, `new Date(...)` juggling).
`date-fns` is ~13 KB tree-shakeable and replaces ad-hoc date logic with well-tested helpers like
`formatDistanceToNow`, `isToday`, `addDays`, `differenceInCalendarDays`.

**Install:** `npm install date-fns`

### 4. `nanoid` ^5.x — Nano ID generator

**What it unlocks:** AI chat messages and flashcards carry an optional `id?: string` field.
Currently IDs default to a `role-text` template string, which is not stable when messages contain
special characters. `nanoid` generates URL-safe, collision-resistant 21-character IDs with a
tiny ~130 B footprint, replacing the fragile template patterns in `AiStudyPanel.tsx`.

**Install:** `npm install nanoid`

### 5. `jspdf` + `jspdf-autotable` — PDF export

**What it unlocks:** A "Download Progress Certificate" / "Export Study Report" feature on the
`ProgressDashboard` page. Students can generate a PDF summary of completed lessons, streak, and
AI study time — shareable for professional portfolios.

**Install:** `npm install jspdf jspdf-autotable`

### 6. `react-resizable-panels` ^2.x — Resizable split-pane layout

**What it unlocks:** The `PythonRunner` / `CodePlayground` components show code and output
stacked vertically. A draggable split pane would let users resize the editor vs. output areas,
significantly improving the coding exercise UX.

**Install:** `npm install react-resizable-panels`

### 7. `@xyflow/react` ^12.x — Interactive node graph (React Flow)

**What it unlocks:** The `ConceptGraph` component currently uses raw D3 force simulation.
React Flow provides a polished interactive node-and-edge canvas out of the box with zoom, pan,
node drag, and edge routing — enabling a richer curriculum roadmap / concept dependency graph.
Evaluate bundle impact before adding; D3 stays for other visualisations.

**Install:** `npm install @xyflow/react`

---

## Automation — Weekly Surge Deployment

`deploy-surge.yml` updated to add a weekly `schedule` trigger (Sundays 02:00 UTC) so
`coding-for-mba.surge.sh` is automatically refreshed every week even without a release.
Manual `workflow_dispatch` and `release: published` triggers are preserved.
