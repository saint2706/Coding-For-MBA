# Option A — "Preserve & Refine": Implementation Spec

**Status:** Ready to implement. This supersedes the Direction A section of `docs/design/redesign-ideas.md` with concrete, file-level detail. That doc's Direction B ("Editorial Business Journal") and its open decisions are **resolved below** and are no longer open — see "Decisions locked" section.

**How to use this doc:** it's organized into 8 phases, roughly in priority/dependency order. Each item states *why*, exactly *which files* it touches, the *current* code/behavior (so you can verify you're looking at the right thing before changing it), the *target* behavior, *states* to handle (empty/loading/error where relevant), and *acceptance criteria*. Phases are independent enough to ship one at a time — don't feel obligated to do them in one pass. Within a phase, items are independent of each other unless a "Depends on" note says otherwise.

**Philosophy (do not lose this while implementing):** the app's identity — "The Analyst's Terminal" in `src/styles/variables.css` — is already good and already avoids nearly every AI-slop default (no Inter, no AI-purple, no filler-verb copy, no generic three-card grids, real Phosphor icons, single lime accent used surgically, hairline borders instead of shadows). Every change below must **reinforce that identity**, not dilute it. Concretely, that means:

- One accent color per palette, used surgically. Never introduce a second saturated hue into a palette "just for this feature."
- No emoji. The codebase already documents this rule in `Sidebar.tsx` ("no emoji icons") — apply it everywhere, including places that currently violate it (see Phase 1.2).
- Hairline borders (`--rule-hairline` / `--border-card`) over shadows or filled color blocks.
- Mono (`--font-mono` / JetBrains Mono) for UI chrome, numerals, and anything "system-reported." Serif (`--font-display` / Fraunces) for editorial voice (headlines, deck copy). Don't mix them within one text element.
- `font-variant-numeric: tabular-nums` on any stat/counter that changes (the codebase already does this in `progress.css` and `sidebar.css` — match it).
- Every new interactive surface respects `prefers-reduced-motion` (the existing `--motion-duration-active-*` tokens already collapse to `0ms` under that media query — reuse them, don't hand-roll new animations that skip this).
- Every new empty/loading/error state is accessible: `role="status"` / `aria-live` where appropriate, real text for screen readers, not just a visual glyph.

---

## Decisions locked (do not re-litigate these while implementing)

1. **Legacy palettes (7 candy-colored options): replaced, not retired or demoted.** See Phase 0.1 for the 3 replacement palettes and exact token values.
2. **"ISSUE 01" numbering on Home: dropped.** No numbered-issues content system is being built. See Phase 0.3.
3. **Settings "dotfile-style key:value" redesign: dropped.** Settings stays a standard accessible form. Only the palette-picker bug (Phase 0.1) and light visual polish apply.
4. Direction B ("Editorial Business Journal") is fully out of scope for this spec. Do not port any Direction B ideas in while doing this work.

---

## Phase 0 — Quick, high-confidence fixes

These are small, low-risk, and each ships independently. Do all of them first; they're prerequisites for a coherent Settings page (0.1) and remove real bugs (0.1, 0.2) and a dead-end flourish (0.3).

### 0.1 Fix the palette picker: show current palettes, replace the legacy 7

**Why:** `src/pages/SettingsPage.tsx`'s `PALETTES` array only lists the 7 pre-rebrand palettes (`peach-sorbet`, `gradient-blues`, `neon-party`, `deep-ocean-blue`, `pastel-dreamland`, `golden-summer-fields`, `light-steel`). The two *current* palettes (`terminal-dark`, `bone-light`) are fully implemented in `src/styles/variables.css` but **aren't selectable anywhere in the UI**. This is a bug, not a design choice.

**Decision:** replace the legacy 7 with 3 new on-brand palettes that extend the existing ink/bone/signal system instead of reintroducing pre-rebrand candy colors. Final palette lineup (5 total, all selectable):

| id | label | base | accent |
|---|---|---|---|
| `terminal-dark` | Terminal Dark | dark | signal-lime (existing) |
| `bone-light` | Bone Light | light | ink-on-bone (existing) |
| `signal-rose` | Signal Rose | dark | new rose accent |
| `signal-cyan` | Signal Cyan | dark | new cyan accent |
| `high-contrast` | High Contrast | light | ink-on-white, AAA target |

**Why these three and not amber/teal-based palettes:** `--amber-500` and `--teal-500` are already semantic status colors (warning / success, reused in Phase 1.2's callout restyle). Making either one a palette's `--accent-primary` would make a warning callout visually identical to the primary CTA color on that palette. Rose and cyan are new, dedicated primitives that don't collide with any existing status semantic.

**File: `src/styles/variables.css`**

Add two new primitive scales near the existing `--signal-*` block (after line ~45, alongside the other primitive scales):

```css
/* Rose accent — dedicated to the Signal Rose palette, distinct from --ruby-500 (error) */
--rose-300: #ff9dbd;
--rose-500: #ff4f86;
--rose-700: #c22a5c;

/* Cyan accent — dedicated to the Signal Cyan palette, distinct from --teal-500 (success) */
--cyan-300: #8fe9ff;
--cyan-500: #22cdfa;
--cyan-700: #0f93b8;
```

Add three new palette blocks after the existing `[data-palette='bone-light']` block and *before* the `===== LEGACY PALETTES =====` comment. Each new block should mirror the **full structure** of `[data-palette='terminal-dark']` (all the same custom properties: `--bg-*`, `--text-*`, `--accent-*`, `--border-*`, `--gradient-*`, `--shadow-*`, `--reading-*`, `--reading-theme-*`) — only the values differ per the table below. Do not skip any token the `terminal-dark` block defines; a missing token silently falls back to the `:root` default and breaks palette isolation.

**`[data-palette='signal-rose']`** (dark base, identical structure to `terminal-dark`, swap every `--signal-*` reference for `--rose-*`):
- `--accent-primary: var(--rose-500)`, `--accent-secondary: var(--rose-300)`, `--accent-tertiary: var(--amber-500)` (keep amber as the tertiary/warning accent — it's a status color, not this palette's brand color)
- `--accent-glow: rgba(255, 79, 134, 0.18)`
- `--border-active: rgba(255, 79, 134, 0.45)`
- `--shadow-glow: 0 0 0 1px var(--border-active)`
- `--text-on-accent: var(--ink-900)` (verify contrast — rose-500 is light enough for dark ink text; if you change the hex, re-check this)
- All `--bg-*`, `--text-primary/secondary/muted/heading`, `--border-subtle/card` values: identical to `terminal-dark` (same ink/bone dark base — only the accent changes)
- `--reading-theme-accent-primary: var(--rose-300)`, `--reading-theme-border-active: rgba(255, 79, 134, 0.32)`, `--reading-theme-accent-glow: rgba(255, 79, 134, 0.08)`

**`[data-palette='signal-cyan']`** (dark base, same pattern, swap `--signal-*` for `--cyan-*`):
- `--accent-primary: var(--cyan-500)`, `--accent-secondary: var(--cyan-300)`, `--accent-tertiary: var(--amber-500)`
- `--accent-glow: rgba(34, 205, 250, 0.18)`
- `--border-active: rgba(34, 205, 250, 0.45)`
- `--text-on-accent: var(--ink-900)`
- Everything else identical to `terminal-dark`'s dark base.
- `--reading-theme-accent-primary: var(--cyan-300)`, `--reading-theme-border-active: rgba(34, 205, 250, 0.32)`, `--reading-theme-accent-glow: rgba(34, 205, 250, 0.08)`

**`[data-palette='high-contrast']`** (light base, accessibility-first — this is the one deliberate exception to "no pure black/pure white" in this codebase; document it as such with a CSS comment):
- `--bg-primary: #ffffff`, `--bg-secondary: #ffffff`, `--bg-card: #ffffff`, `--bg-card-hover: var(--bone-100)`, `--bg-surface: #ffffff`, `--bg-code: var(--bone-100)`
- `--text-primary: #000000`, `--text-secondary: #1b1b20` (ink-700), `--text-muted: var(--ink-500)`, `--text-heading: #000000`
- `--accent-primary: #000000` (ink-as-accent, same pattern as `bone-light`, but pushed to true black for maximum contrast), `--accent-secondary: var(--ink-700)`, `--accent-tertiary: var(--signal-700)` (darkened lime, meets AA on white — verify with a contrast checker before shipping, target ≥4.5:1 for the tertiary use, ≥7:1 for primary text)
- `--border-subtle: rgba(0, 0, 0, 0.16)`, `--border-card: rgba(0, 0, 0, 0.28)`, `--border-active: #000000` (thicker/darker borders than other palettes — this palette should read as unambiguously higher-contrast, not just "bone-light again")
- `--text-on-accent: #ffffff`
- `--reading-theme-*`: mirror the light-base pattern from `bone-light`'s reading tokens but with the same true-black/white push.
- Add a code comment directly above this block: `/* Deliberate exception to the "no pure black/white" rule — this palette exists specifically for users who need maximum contrast. */`

Delete the entire `===== LEGACY PALETTES (preserved for backward compat) =====` section (all 7 blocks, roughly lines 270–669) — do not keep them "just in case." See the migration note below for how existing users on a legacy palette are handled instead.

**File: `src/stores/userPreferencesStore.ts`**

- Update `ColorPaletteSchema`: remove the 7 legacy enum values, add `'signal-rose'`, `'signal-cyan'`, `'high-contrast'`. Final enum: `['terminal-dark', 'bone-light', 'signal-rose', 'signal-cyan', 'high-contrast']`.
- Bump the persist `version` from `6` to `7`.
- In `migrate()`, add a `version < 7` branch that remaps any legacy palette id to a same-mood replacement **before** schema validation, so returning users land somewhere sensible instead of silently falling back to the default:
  ```ts
  const LEGACY_PALETTE_REMAP: Record<string, ColorPalette> = {
    'peach-sorbet': 'bone-light',
    'gradient-blues': 'signal-cyan',
    'neon-party': 'signal-rose',
    'deep-ocean-blue': 'signal-cyan',
    'pastel-dreamland': 'high-contrast',
    'golden-summer-fields': 'bone-light',
    'light-steel': 'high-contrast',
  }
  if (version < 7 && typeof palette === 'string' && palette in LEGACY_PALETTE_REMAP) {
    palette = LEGACY_PALETTE_REMAP[palette]
  }
  ```
  Place this logic alongside the existing `v5→v6` gradient-blues remap (same function, same pattern — don't create a second migration mechanism).

**File: `src/pages/SettingsPage.tsx`**

- Replace the `PALETTES` array entirely. New array has 5 entries, `terminal-dark` and `bone-light` **first** (they're the current defaults, not afterthoughts):
  ```ts
  const PALETTES: { id: ColorPalette; label: string; swatches: string[] }[] = [
    { id: 'terminal-dark', label: 'Terminal Dark', swatches: ['#0b0b0c', '#131316', '#1b1b20', '#d4ff3f'] },
    { id: 'bone-light', label: 'Bone Light', swatches: ['#faf6ec', '#f1ece0', '#0b0b0c', '#a8cc0f'] },
    { id: 'signal-rose', label: 'Signal Rose', swatches: ['#0b0b0c', '#131316', '#1b1b20', '#ff4f86'] },
    { id: 'signal-cyan', label: 'Signal Cyan', swatches: ['#0b0b0c', '#131316', '#1b1b20', '#22cdfa'] },
    { id: 'high-contrast', label: 'High Contrast', swatches: ['#ffffff', '#000000'] },
  ]
  ```
  (Swatch arrays should visually preview each palette's actual bg/accent progression — adjust the exact stops if you change any hex above, but keep 3–4 swatches per palette for visual consistency in the grid, except `high-contrast` which only needs 2 to read correctly.)
- No other changes needed to `SettingsPage.tsx` — the existing `palette-grid` / `palette-swatch-btn` rendering logic already works generically off this array.

**Acceptance criteria:**
- [ ] Settings → Appearance → Color palette shows exactly 5 options: Terminal Dark, Bone Light, Signal Rose, Signal Cyan, High Contrast.
- [ ] Selecting each one visibly changes the whole app (nav, sidebar, cards, lesson reader) — spot-check Home, a Lesson page, and Progress dashboard in each palette.
- [ ] A user with `peach-sorbet` (or any other legacy id) already in `localStorage` loads the app and lands on a coherent replacement palette (per the remap table) with no console errors and no broken/undefined CSS custom properties (check devtools computed styles for any token showing `unset` or empty).
- [ ] `high-contrast` palette: run a contrast checker on body text (`--text-primary` on `--bg-primary`) and confirm ≥7:1. Confirm focus rings and `--border-active` are clearly visible against `--bg-card`.
- [ ] `pnpm run typecheck` passes (the `ColorPalette` type is used in several places — search for `ColorPalette` and `useUserPreferencesStore` to confirm nothing else hardcodes the old enum, e.g. tests).
- [ ] Search the test suite (`tests/unit/**`) for references to any of the 7 removed palette ids or to `PALETTES` in `SettingsPage` and update those tests to match the new 5-entry array.

**Effort:** M (mostly mechanical, but the new CSS blocks need care and the migration needs a real test).

---

### 0.2 Fix PWA theme-color mismatch

**Why:** `#4361ee` (a blue) doesn't match the signal-lime brand anywhere else in the app. This is what browsers/OSs use to tint the address bar and app switcher on mobile/PWA install — it's a visible, easy-to-notice mismatch.

**Files:**
- `index.html` line 24: `<meta name="theme-color" content="#4361ee" />`
- `public/manifest.json` line 9: `"theme_color": "#4361ee"`

**Target:** change both to the ink-900 primitive value, `#0b0b0c` (matches `--bg-primary` in the default `terminal-dark` palette — the theme-color should match what most users will actually see, i.e., the dark default, not the light alternative). Also verify `public/manifest.json`'s `"background_color"` (currently `#0f0f0f`, line 8) — it's already close to ink-900 but not exact; align it to `#0b0b0c` too for consistency, or leave it if you determine `#0f0f0f` was an intentional splash-screen choice (check git blame before changing something that isn't actually broken).

**Acceptance criteria:**
- [ ] Both files show `#0b0b0c` for theme-color.
- [ ] Load the app on a mobile browser (or Chrome DevTools device emulation) and confirm the address bar / OS chrome now tints dark ink instead of blue.
- [ ] `pnpm run build` still succeeds (manifest.json is copied as a static asset — verify it's not schema-validated at build time in a way that would reject the change).

**Effort:** S (literally two one-line edits, but don't skip manual verification — this is exactly the kind of "trivial" fix that's easy to typo).

---

### 0.3 Drop "ISSUE 01" numbering from Home

**Why:** decided above — no numbered-issues content system is being built, so the numbering is a dead-end flourish per the audit. Removing it is simpler than inventing content-ops infrastructure that isn't needed.

**File: `src/pages/Home.tsx`** (around lines 188–199, inside `<EditorialCover.Eyebrow>`)

**Current:**
```tsx
<EditorialCover.Eyebrow>
  <span className="cover-issue">ISSUE 01</span>
  <span className="cover-divider" aria-hidden="true">
    ...
  </span>
  <span>The Analyst&apos;s Terminal</span>
</EditorialCover.Eyebrow>
```

**Target:** remove the `cover-issue` span and its divider; keep just the masthead name:
```tsx
<EditorialCover.Eyebrow>
  <span>The Analyst&apos;s Terminal</span>
</EditorialCover.Eyebrow>
```

**File: `src/styles/home.css`** (or wherever `.cover-issue` / `.cover-divider` are defined) — remove the now-unused rules. Grep for `cover-issue` and `cover-divider` across `src/styles/` to confirm you're not removing something also used elsewhere (it shouldn't be, but verify).

**Acceptance criteria:**
- [ ] Home hero eyebrow reads just "The Analyst's Terminal" with no issue number or divider glyph.
- [ ] No orphaned CSS rules left behind (grep confirms `cover-issue`/`cover-divider` have zero remaining references after the CSS cleanup).
- [ ] Visually re-check the eyebrow's spacing/alignment isn't broken now that it's a single element instead of three.

**Effort:** S.

---

## Phase 1 — Terminal-flavored states (cross-cutting)

**Why this phase matters most:** the audit found that error/empty/loading states and markdown callouts are the app's biggest inconsistency — they're generic (purple/indigo gradient SVGs, emoji-prefixed colored boxes) in an app that is otherwise disciplined about its single-accent, no-emoji, hairline-border identity. This is the highest-value visual fix in Direction A because it's the most visible break in an otherwise-coherent system.

### 1.1 Replace off-brand empty-state illustrations

**Why:** `src/components/EmptyStateIllustrations.tsx` hardcodes `rgba(99,102,241,...)` (indigo) and `rgba(167,139,250,...)` (violet) gradients in `SearchEmptyIllustration`, `ExercisesEmptyIllustration`, and `FreshStartIllustration`. These are literally the generic "AI purple" gradient the app's own design system explicitly rejects everywhere else (`--gradient-hero: none`, single signal-lime accent). They don't reference any design token — they're one-off hex values from before the rebrand.

**Target:** replace all three illustrations with a shared terminal-flavored visual vocabulary instead of gradient blob art:

- **`SearchEmptyIllustration`** → a `$ no results for "{query}"` prompt-style block: a mono text row styled like a terminal prompt, with a blinking-cursor-style trailing block (respecting `prefers-reduced-motion` — static when reduced motion is on). This can be a much simpler component than the current SVG — consider whether it needs to be an SVG at all, or whether a styled `<div>` with mono text is more honest and more on-brand (an SVG line-drawing of a magnifying glass in ink/bone colors is also acceptable if you want to keep an illustration, but it must use `var(--text-muted)` / `var(--accent-primary)` / `var(--border-card)`, never hardcoded hex).
- **`ExercisesEmptyIllustration`** → same treatment, contextualized for exercises (`$ no exercises match these filters`).
- **`FreshStartIllustration`** → this one is a genuine "welcome" moment (shown on Progress dashboard when `completedCount === 0`), not a "no results" moment — keep it visually distinct from the other two. A simple terminal "boot" motif (e.g., a blinking cursor next to `$ ready to start_` or similar) fits better than a rocket-ship SVG, which reads as generic app-onboarding cliché rather than this app's specific "workstation" metaphor.

**Concrete implementation guidance:** every color used by these components must resolve through a CSS custom property (`var(--text-muted)`, `var(--accent-primary)`, `var(--border-card)`, etc.), never a literal hex or `rgba(...)`. This is what makes them automatically correct across all 5 palettes from Phase 0.1 — a hardcoded indigo gradient would look wrong on `signal-rose` or `high-contrast` too, not just on the current palettes.

**Files touched:** `src/components/EmptyStateIllustrations.tsx` (rewrite), plus wherever `.empty-state-illustration`, `.empty-state-line`, `.empty-state-dot` are styled (grep to find the stylesheet — likely `ux-features.css` or a dedicated file) — update or replace those rules to match the new mono/terminal visual language.

**Callers to verify still work after the rewrite** (props/exports must stay compatible, or update all call sites):
- `SearchEmptyIllustration` — used in `SearchResults.tsx` (verify via grep)
- `ExercisesEmptyIllustration` — used in `src/pages/Exercises.tsx`
- `FreshStartIllustration` — used in `src/pages/ProgressDashboard.tsx` line 216

**Acceptance criteria:**
- [ ] Zero remaining `rgba(99,102,241` / `rgba(167,139,250` / `rgba(14,165,233` / `rgba(52,211,153` / `rgba(251,191,36` literal color references anywhere in `EmptyStateIllustrations.tsx` (these are the current hardcoded purples/blues/greens — grep to confirm).
- [ ] All three empty states render correctly (visually check) on at least `terminal-dark` and `bone-light`; spot check one more palette from Phase 0.1.
- [ ] Reduced-motion: any blinking-cursor or animated element collapses to static under `prefers-reduced-motion: reduce` (test via OS-level setting or DevTools rendering emulation).
- [ ] Each illustration still has an accessible text alternative (a real `<p>` describing the empty state, not just `aria-hidden` SVG — this already exists in the callers; don't regress it).

**Effort:** M.

### 1.2 Restyle markdown callouts: drop emoji, drop off-brand hex, use hairline treatment

**Why:** `src/styles/markdown.css` (lines 169–240) defines 5 callout types (`note`, `tip`, `important`, `warning`, `danger`) that (a) use emoji prefixes (`ℹ️ Note`, `💡 Tip`, `📌 Important`, `⚠️ Warning`, `🚫 Danger`) despite the codebase's own documented no-emoji rule, and (b) use 5 arbitrary hardcoded hex colors (`#3b82f6` blue, `#22c55e` green, `#a855f7` purple, `#f59e0b` amber, `#ef4444` red) that don't reference any design token and don't survive a palette switch coherently.

**Current implementation reference** (`src/styles/markdown.css` lines 169–240, `src/utils/remark-callouts.ts`): callouts are generated from GitHub-style `> [!NOTE]` blockquotes by the `remarkCallouts()` remark plugin, which tags them `<div class="callout callout-{type}" data-callout="{type}">`. The label text and "icon" are injected purely via CSS `::before { content: '...' }` — meaning this is a pure CSS fix, no changes needed to `remark-callouts.ts` or `MarkdownFragment.tsx`.

**Target:** terminal-style annotations per the ideas doc — mono `# NOTE:` / `# TIP:` / `# IMPORTANT:` / `# WARNING:` / `# DANGER:` prefixes, hairline left-border instead of a filled color background, using existing design tokens instead of new hex values:

```css
.markdown-body .callout {
  margin: 1.5rem 0;
  padding: 0.85rem 1rem 0.9rem 1.1rem;
  border: var(--rule-hairline);
  border-left: 3px solid var(--callout-accent, var(--accent-primary));
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  font-style: normal;
}

.markdown-body .callout::before {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: var(--tracking-mono);
  text-transform: uppercase;
  color: var(--callout-accent, var(--accent-primary));
  margin-bottom: 0.35rem;
}

.markdown-body .callout-note { --callout-accent: var(--accent-primary); }
.markdown-body .callout-note::before { content: '# NOTE:'; }

.markdown-body .callout-tip { --callout-accent: var(--teal-500); }
.markdown-body .callout-tip::before { content: '# TIP:'; }

.markdown-body .callout-important { --callout-accent: var(--accent-primary); }
.markdown-body .callout-important::before { content: '# IMPORTANT:'; }

.markdown-body .callout-warning { --callout-accent: var(--amber-500); }
.markdown-body .callout-warning::before { content: '# WARNING:'; }

.markdown-body .callout-danger { --callout-accent: var(--ruby-500); }
.markdown-body .callout-danger::before { content: '# DANGER:'; }
```

Notes on this design:
- Background is now a flat `var(--bg-surface)` (a token that already adapts per-palette), not a colored tint — matches the "hairline rules instead of card shadows" philosophy in variables.css. The left-border color is the only place status color appears, which is enough for scannability without turning the whole box into a colored chip.
- `note` and `important` intentionally both map to `--accent-primary` (the palette's single brand accent) rather than inventing a 4th/5th distinct hue — only `tip` (teal/success), `warning` (amber), and `danger` (ruby) get dedicated status colors, because those three map to real semantic meaning (success/caution/error) that existing tokens already carry elsewhere in the app (check `--teal-500`, `--amber-500`, `--ruby-500` usage elsewhere to confirm this mapping is consistent with how the app already uses those colors, e.g. in gamification or diff/status UI if any exists).
- Verify this doesn't collide with the Phase 0.1 `signal-rose`/`signal-cyan` palettes: since `--teal-500`/`--amber-500`/`--ruby-500` are primitives (not palette-overridden), callouts will render identically across all 5 palettes, which is correct — status colors should be palette-invariant.

**Acceptance criteria:**
- [ ] Zero emoji anywhere in `markdown.css`'s callout rules (grep the file for any emoji character to confirm).
- [ ] Zero hardcoded hex colors in the callout rules — every color is a `var(--...)` reference.
- [ ] Visually render a lesson containing all 5 callout types (search `src/content/` or wherever lesson markdown lives for an existing `[!NOTE]`/`[!TIP]`/etc. example, or temporarily add one to a test lesson) and confirm each renders with the correct mono label and hairline-left-border treatment, no filled background tint.
- [ ] Switch palettes while viewing that lesson and confirm callouts remain legible and on-brand in at least `terminal-dark`, `bone-light`, and `high-contrast`.
- [ ] Screen reader check: the `::before` label text (`# NOTE:` etc.) is decorative CSS content, not real DOM text — confirm there's still a way for screen reader users to know the callout type. If `data-callout="{type}"` isn't currently exposed via an accessible name, add an `aria-label` or visually-hidden text node via the remark plugin (small change to `remark-callouts.ts`'s `hProperties` to add e.g. `'aria-label': `${type} callout`` on the wrapping div) — check whether this gap already exists before assuming it needs fixing.

**Effort:** M (the CSS is small; the emoji removal must not silently break the a11y label, which needs verification).

### 1.3 Terminal-flavored loading skeletons for lesson content

**Why:** `src/components/Skeleton.tsx` provides generic `text`/`heading`/`card`/`block` shimmer placeholders (`PageSkeleton` composes them for the route-level Suspense fallback in `App.tsx`). The ideas doc suggests a "boot-sequence" feel — lines resolving top-to-bottom like a terminal printing output — instead of generic shimmer blocks, specifically for lesson content loading (the highest-visibility loading state, since it's what every lesson navigation shows).

**Scope decision:** don't replace the generic `Skeleton` component wholesale (it's used in several contexts and a full terminal-boot treatment doesn't fit every one, e.g. small inline skeletons). Instead:
- Keep `Skeleton.tsx`'s shimmer as the default for small/generic placeholders.
- Add a new variant specifically for the lesson-content Suspense fallback (used via `PageSkeleton` when navigating to `/lesson/:dayNum`, per `App.tsx` line 99's `<Suspense fallback={<PageSkeleton />}>`). Since `PageSkeleton` is shared across all routes, either (a) add a `variant` prop to `PageSkeleton` that `Lesson.tsx` can't actually control (it's the Suspense fallback, rendered before `Lesson.tsx` mounts) — so instead, (b) create the boot-sequence treatment as CSS-only variation applied to the *existing* skeleton shapes: lines fade/resolve in sequence (staggered opacity, top-to-bottom) rather than a uniform shimmer sweep, and only apply this specific animation via a route-aware wrapper.

**Recommended concrete approach:** add a `bootSequence?: boolean` prop to `Skeleton`, and pass a distinct fallback for the lesson route specifically:
```tsx
// App.tsx — lesson route gets its own Suspense boundary with a distinct fallback
<Route path="/lesson/:dayNum" element={<Lesson />} />
```
Wrap just this route (or use `react-router`'s per-route fallback pattern if the router version supports it cleanly — check `react-router-dom` v7's data APIs, or simpler: give `Lesson.tsx` internal loading state its own skeleton component `LessonSkeleton` rendered inside `Lesson.tsx` itself if it has an internal loading phase, rather than fighting the route-level Suspense fallback). **Before implementing, read `Lesson.tsx` in full to determine whether lesson content loading is actually async client-side (justifying an internal skeleton) or purely route-level Suspense (justifying a route-specific fallback) — the correct integration point depends on this.**

**Visual spec for the boot-sequence variant:**
- Each skeleton line/block fades in with a staggered delay (`animation-delay: calc(var(--index) * 80ms)` or Motion's `staggerChildren`), top to bottom, opacity 0→1, no horizontal shimmer sweep.
- Use `--font-mono` sizing/spacing rhythm even though the placeholders have no text (i.e., line-height and block heights should imply a mono-typeset block, matching what will actually load).
- Duration and stagger respect `prefers-reduced-motion`: reduced-motion users get an instant, fully-visible skeleton (no stagger, no fade) — reuse `--motion-duration-active-fast` (already `0ms` under reduced motion) rather than a new hardcoded duration.

**Acceptance criteria:**
- [ ] Navigating to a lesson (especially on throttled network in DevTools) shows the new staggered/boot-sequence skeleton instead of the generic shimmer, specifically for the lesson route.
- [ ] Other routes' loading states (via generic `PageSkeleton`) are unchanged.
- [ ] `prefers-reduced-motion: reduce` collapses the stagger to instant full-visibility.
- [ ] No layout shift between skeleton and real content (verify the skeleton's block/line dimensions roughly match the real `EditorialLessonHeader` + content layout it's standing in for).

**Effort:** M–L (the routing/integration-point question above needs a real read of `Lesson.tsx` before starting; don't guess).

---

## Phase 2 — Build the command palette the app already promises

**Why:** `src/pages/NotFound.tsx` (lines 65–68) tells users "Press `⌘K` to open the command palette" — this feature doesn't exist. No keydown handler anywhere in the codebase binds `metaKey`/`ctrlKey` + `k`. This is the single most on-brand feature gap for a "workstation" identity, and it's already-promised, not speculative.

**Key finding from research — don't rebuild from scratch:** `src/components/SearchPalette.tsx` is a **fully-built, working command-palette-shaped component** (fuzzy search via `src/utils/searchIndex.ts`, full keyboard nav — arrow keys/Enter/Escape, debounced input, result snippets, loading/empty states) that is **never imported or rendered anywhere in the app** (confirmed via repo-wide grep — it only appears in its own file). It is not "half-built" — it's complete for lesson search, just disconnected. This phase is about **wiring it up and extending it with quick actions**, not building a palette from zero.

### 2.1 Wire up `SearchPalette` and bind `⌘K` / `Ctrl+K`

**File: `src/App.tsx`**

- Add local state: `const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)`.
- Add a global keydown listener (same pattern as `KeyboardShortcutsOverlay.tsx`'s `?` binding — reuse `isTypingInEditableElement` from `src/utils/shortcuts.ts` to avoid hijacking the shortcut while a user is typing in a form field, *except* the palette's own input once open):
  ```ts
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if (isCmdK) {
        event.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  ```
  Note: `⌘K`/`Ctrl+K` should work even while typing in most inputs (it's a modifier chord, unlikely to collide with normal typing) — unlike the bare `/` shortcut, don't gate this one behind `isTypingInEditableElement`. Do exclude it while the palette's own input is focused and being submitted normally (not an issue since it's a toggle, not a single-fire action, but verify no double-open/close glitch when the user has the palette open and presses `⌘K` again — the toggle above handles this correctly, closing it).
- Render `<SearchPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />` inside the existing `<Suspense fallback={null}>` block alongside `MobileNav` / `KeyboardShortcutsOverlay` (line 118–122), lazy-imported the same way (`const SearchPalette = lazy(() => import('./components/SearchPalette'))`).
- Add a `SHORTCUTS` entry in `src/utils/shortcuts.ts` (same array `KeyboardShortcutsOverlay` reads from): `{ keys: '⌘K / Ctrl+K', description: 'Open command palette', scope: 'Global' }`.

**Acceptance criteria:**
- [ ] `⌘K` (Mac) / `Ctrl+K` (Windows/Linux) opens the palette from any page, including while focus is inside the Navbar's inline search input.
- [ ] Pressing it again while open closes the palette.
- [ ] `Esc` closes it (already implemented in `SearchPalette.tsx`'s `handleKeyDown`).
- [ ] The Keyboard Shortcuts overlay (`?`) now lists the `⌘K` binding under "Global".
- [ ] `NotFound.tsx`'s existing copy ("Press `⌘K` to open the command palette") is now accurate — no copy change needed there, just verify it.
- [ ] Opening the palette from a lesson page and searching still correctly navigates via `navigate(\`/lesson/${result.item.day}\`)` (existing behavior — just confirm it still works once actually mounted in the real app, since it's never been exercised end-to-end before).

**Effort:** S (the component itself is done; this is wiring).

### 2.2 Add quick actions to the palette (empty-query state)

**Why:** the ideas doc specifically calls for actions beyond lesson search: "jump to any lesson/phase/exercise, run 'mark day N complete,' toggle reading mode, jump to Settings." Currently `SearchPalette` shows nothing until the user types ≥2 characters (line 78: `if (trimmed.length < 2) return []`). Add a quick-actions list shown specifically when the query is empty, so `⌘K` is useful immediately, not just as a search box.

**File: `src/components/SearchPalette.tsx`**

Add a `QuickAction` concept alongside the existing `SearchResult` rendering:
```ts
interface QuickAction {
  id: string
  label: string
  hint?: string
  onRun: () => void
}
```

Build the quick-actions list inside the component (needs `useNavigate`, `useLocation`, and store access — all already importable):
- **Go to Curriculum** → `navigate('/curriculum')`
- **Go to Progress** → `navigate('/progress')`
- **Go to Exercises** → `navigate('/exercises')`
- **Go to Settings** → `navigate('/settings')`
- **Toggle reading mode** → `useUserPreferencesStore.getState().setReadingMode(!useUserPreferencesStore.getState().readingMode)` (label should reflect current state, e.g. "Turn reading mode on/off")
- **Mark Day {day} complete** → only included when `location.pathname` matches `/lesson/:dayNum` **and** that lesson isn't already in `useProgressStore.getState().completedLessons`. Calls `useProgressStore.getState().markLessonComplete(day)` (exact method name confirmed in `src/stores/progressStore.ts`). Close the palette after running it and show a toast confirmation (reuse `toastInfo`/`toastSuccess` pattern from `src/utils/toast.ts`, matching how `Navbar.tsx` already uses `toastInfo`).
- **Open keyboard shortcuts** → since `KeyboardShortcutsOverlay` manages its own `isOpen` state internally (triggered only by its own `?` keydown listener), either (a) lift that state up so `SearchPalette` can trigger it too, or (b) simulate the `?` keypress. Prefer (a): it's a small refactor (move `isOpen` state to `App.tsx`, pass down as props to `KeyboardShortcutsOverlay`) and avoids a hacky synthetic-event workaround. **This is a real cross-component refactor — do it carefully and re-verify the existing `?` binding still works after lifting the state.**

**UI treatment:** when `query.trim().length === 0` (and the palette is open), render this quick-actions list in place of (not in addition to) the current "type to search" empty view. Each row should look like a `search-result-item` for visual consistency (reuse the existing CSS classes/structure) but without the day/title/tags metadata — just an icon (Phosphor, matching the app's icon family — e.g. `Compass` for navigation actions, `CheckCircle` for mark-complete, `BookOpen` for reading mode, `Keyboard` for shortcuts) + label + optional keyboard hint on the right (mono, dim, e.g. `↵`).

Keyboard nav (arrow up/down, Enter) must work identically across quick actions and search results — i.e., the existing `activeIndex` state and its handlers need to operate over a combined list (`quickActions` when query is empty, `results` when not), not two disconnected pieces of state. Refactor `activeIndex`'s consumers accordingly rather than adding a second index variable.

**Acceptance criteria:**
- [ ] Opening the palette with no query shows the quick-actions list (not a blank state, not "type to search").
- [ ] All 5 core actions work: navigate to Curriculum/Progress/Exercises/Settings, toggle reading mode (verify it actually flips in Settings after running), mark current lesson complete (only shown/actionable on a lesson page, only when not already complete; verify it updates the sidebar's checkmark and Progress dashboard count after running).
- [ ] Arrow keys and Enter work correctly across quick actions, and typing a query correctly switches to search results without a jarring focus/selection glitch.
- [ ] Opening keyboard shortcuts from the palette actually opens `KeyboardShortcutsOverlay` (verify the state-lifting refactor didn't break the existing `?` shortcut).
- [ ] Screen reader: quick actions are in the same `role="listbox"`/`role="option"` structure as search results (or an equally accessible pattern) — don't ship a keyboard-nav-only-visually-indicated list.

**Effort:** L (this is the biggest single item in the whole spec — real new interaction logic, a state-lifting refactor, and several store integrations).

---

## Phase 3 — Sidebar: real git-status-style indicators + collapse-by-default

### 3.1 Add an "in-progress" indicator distinct from "done"

**Why:** `src/components/SidebarPhaseGroup.tsx` (lines 125–130) currently renders only two states per lesson: `✓` (completed, `.day-link-prefix.completed`) or `·` (not started). The ideas doc asks for a third, git-status-style "modified/in-progress" state — the sidebar already borrows VS Code's file-tree visual language, so leaning into the git-status metaphor (modified/staged dot) is a natural, on-metaphor extension, not a new visual language.

**Data already available — no new tracking needed:** `src/stores/learningAnalyticsStore.ts` already tracks `timeByLessonDay: Record<number, number>` (milliseconds spent per lesson day, keyed the same way as `completedLessons`). "In progress" = a lesson with `timeByLessonDay[day] > 0` that is **not** in `completedSet`. This is exactly the "started but not finished" signal needed, with zero new state.

**File: `src/components/SidebarPhaseGroup.tsx`**

- Import `useLearningAnalyticsStore` and select `timeByLessonDay`.
- `SidebarPhaseGroup` currently receives `completedIdsJoined` as a serialized prop (deliberately, to keep `React.memo` comparisons cheap — see the `propsAreEqual` custom comparator). Follow the **same pattern** for in-progress state: pass a new `inProgressIdsJoined: string` prop from `Sidebar.tsx` (computed the same way `completedIdsByPhase` is computed, lines 81–99, but checking `timeByLessonDay[id] > 0 && !completedSet.has(id)` instead of `completedSet.has(id)`), and extend `propsAreEqual` to also compare `inProgressIdsJoined`. **Do not** just read `useLearningAnalyticsStore` directly inside `SidebarPhaseGroup` without going through this serialized-prop pattern — that would silently break the existing memoization strategy (a raw Zustand subscription inside a memoized child re-renders on every store change regardless of the custom comparator, defeating the point of `propsAreEqual`).
- In the per-lesson `<Link>` render (line 118–138), add the third state:
  ```tsx
  const isCompleted = completedSet.has(dayTokenToProgressId(lesson.day))
  const isInProgress = !isCompleted && inProgressSet.has(dayTokenToProgressId(lesson.day))
  // ...
  <span
    className={`day-link-prefix ${isCompleted ? 'completed' : ''} ${isInProgress ? 'in-progress' : ''}`}
    aria-hidden="true"
  >
    {isCompleted ? '✓' : isInProgress ? '●' : '·'}
  </span>
  {isCompleted && <span className="sr-only">Completed.</span>}
  {isInProgress && <span className="sr-only">In progress.</span>}
  ```

**File: `src/styles/sidebar.css`** (near the existing `.day-link-prefix.completed` rule, line 322)

```css
.day-link-prefix.in-progress {
  color: var(--amber-500);
}
```
(Amber reads as "in progress / modified" — consistent with its existing use as a warning/attention color elsewhere, and distinct from the accent-primary green-checkmark-equivalent used for `completed`. Verify this doesn't visually clash with the `phase-due` badge, which also uses an accent-tertiary/amber-family color on the same row — check `src/styles/sidebar.css` line 269-272 (`--accent-tertiary`) before finalizing; if both end up amber on the same row, consider using `--ink-200`/`--bone-500` "dim dot" instead for in-progress and reserving amber strictly for the due-count badge, to keep row-level scannability.)

**Acceptance criteria:**
- [ ] Visit a lesson (accruing time via `useLearningAnalytics`, already wired in `App.tsx` line 57) without marking it complete, then check the sidebar — that lesson now shows the in-progress glyph instead of `·`.
- [ ] Marking the lesson complete afterward switches it to `✓` (in-progress state should not persist visually once completed — verify the `!isCompleted` guard actually takes precedence).
- [ ] `React.memo`/`propsAreEqual` still prevents unnecessary re-renders — verify with React DevTools profiler that navigating within one phase doesn't re-render sibling `SidebarPhaseGroup`s that have no relevant state change.
- [ ] Screen reader announces "In progress." for such lessons (verify via the `sr-only` span, same pattern as the existing "Completed." one).
- [ ] Visual check: the in-progress dot and the phase-level due-count badge (`.phase-due`) don't create a confusing double-amber signal on the same row — resolve per the note above if they do.

**Effort:** M.

### 3.2 Collapsible-by-default for completed phases, auto-expand current

**Why:** at 12 phases, the sidebar tree gets long. `Sidebar.tsx` already computes `derivedOpenPhase` (auto-opens the phase containing the current route) and lets the user manually toggle via `manualOpen` state (lines 62–101, 117–119) — but there's no logic to auto-collapse phases the user has *finished*, so a fully-scrolled sidebar with 12 open-by-default (or previously manually-opened) phases stays long even after finishing most of them.

**File: `src/components/Sidebar.tsx`**

- Compute `isPhaseComplete` per phase (same logic `Curriculum.tsx` already has at lines 59: `completedInPhaseCount === lessons.length && lessons.length > 0` — consider extracting this into a shared util, e.g. `src/utils/phaseProgress.ts`, since it's about to exist in two places; check whether such a util already exists before adding a third inline copy).
- Change the "open" determination (currently `openPhase = manualOpen !== null ? manualOpen : derivedOpenPhase`, line 101) so that a phase which is **complete** and **not the current route's phase** and **has not been manually toggled open by the user this session** defaults to collapsed, while the phase containing the current route always auto-expands regardless of completion (a user actively reviewing a completed phase's lesson shouldn't have their own sidebar collapse under them).
- Keep `manualOpen` as the explicit user-override escape hatch it already is — a user should always be able to force any phase open/closed regardless of the default-collapse behavior. The change is only to the *default* state a phase starts in, not to remove manual control.

**Acceptance criteria:**
- [ ] With several early phases fully completed and phase 5 in progress, loading the app shows phases 1–4 collapsed by default and phase 5 (or wherever the current lesson is) expanded.
- [ ] Manually clicking a collapsed completed phase still expands it (manual override unaffected).
- [ ] Navigating to a lesson inside a previously-completed, currently-collapsed phase (e.g., via the command palette from Phase 2, or via a direct link) auto-expands that phase — the "current route wins" rule from `derivedOpenPhase` must still take priority.
- [ ] No regression to the existing scroll-into-view behavier (`Sidebar.tsx` lines 103–115) that scrolls the active link into view on route change.

**Effort:** M (mostly logic; needs careful manual testing across multiple phase-completion states, not just one scenario).

---

## Phase 4 — Home: extend the "live system" framing into the hero

**Why:** `StatusTicker.tsx` already sells "live system" in the navbar (mono, tabular-nums, streak rendered as filled/unfilled block glyphs via its own `streakBlocks()` helper, `role="status"`). The ideas doc suggests pulling that same framing into the Home hero itself — a small "session readout" near the CTA — to reinforce "this is a tool you run," not "a page you read." Since `StatusTicker` already implements almost exactly this pattern, this phase is about **reusing its established visual language**, not inventing a new one.

**File: `src/pages/Home.tsx`** (inside or directly below `<EditorialCover.Actions>`, lines 210–230)

Add a compact readout row, mono, matching `StatusTicker`'s data selection but reformatted for a hero context (larger, more breathing room than the dense navbar ticker):
```
SESSION: {sessionDuration} · STREAK: {streak}d · LAST SYNC: {relativeLastVisit}
```

- `streak`: `useProgressStore((s) => s.streakDays())` — same selector `StatusTicker` already uses.
- `sessionDuration`: check whether a "current session" duration already exists (search `useLearningAnalyticsStore` and `useLearningAnalytics` hook for any live/running-session timer) — if the store only tracks *cumulative* time-by-date, not a live in-progress session clock, don't fabricate one; substitute a real available stat instead (e.g. `todayLearningMs` formatted via the existing `formatDuration` helper from `learningAnalyticsStore.ts`, labeled "TODAY" instead of "SESSION" — pick whichever framing matches what data genuinely exists; do not invent a fake-precise "session uptime" the app isn't actually tracking, per the anti-slop skill's fake-precision rule).
- `relativeLastVisit`: derive from `lastVisitedLesson`/`completionDates` in `progressStore.ts` if a timestamp is available; if the store only has a day-of-completion granularity (not a precise last-visit timestamp), use a coarser label like "LAST SESSION: {date}" rather than a fabricated "2m ago" (again: don't fake precision the data doesn't support — check `progressStore.ts`'s actual fields before deciding the exact label).

**Extract the shared block-glyph helper:** `StatusTicker.tsx`'s `streakBlocks()` function (lines 30–33) is exactly the "row of filled/unfilled mono block characters" pattern the ideas doc separately asks for on the Progress dashboard (Phase 6.1 below). Move it to a shared util (e.g. `src/utils/streakBlocks.ts`) and import it in both `StatusTicker.tsx` and wherever Phase 6.1 needs it, instead of duplicating the string-repeat logic a second time.

**Acceptance criteria:**
- [ ] Hero shows a mono readout row with genuinely-available data (no fabricated precision).
- [ ] Visually consistent with `StatusTicker`'s existing mono/tabular-nums/dot-separator treatment, but sized appropriately for the hero (don't just copy-paste the navbar's compact sizing verbatim — check it against the hero's type scale).
- [ ] `streakBlocks` is a single shared implementation, imported (not duplicated) in both `StatusTicker.tsx` and the new Home readout (and Phase 6.1 if done together).
- [ ] New user with zero streak / zero history: the readout still renders sensibly (e.g. `STREAK: 0d`, not a broken/empty string) — check this explicitly, it's the actual default state for anyone visiting Home for the first time.

**Effort:** S–M.

---

## Phase 5 — Lesson reader: persistent reading-progress breadcrumb

**Why:** some lessons are long; users can lose track of where they are in the 163-day curriculum once scrolled deep into content. `Lesson.tsx` currently shows position only in the masthead (`EditorialLessonHeader`, which scrolls away) and in a `ScrollProgress` bar (visual progress only, no "Day N of 163 · Phase X" text).

**File: `src/pages/Lesson.tsx`** (and a new small component, e.g. `src/components/LessonPositionBreadcrumb.tsx`)

- Add a component that becomes visible once `.lesson-masthead` (rendered by `EditorialLessonHeader`) scrolls out of the viewport, and hides again when it's back in view. Use `IntersectionObserver` on the masthead element (do **not** use a scroll listener — the codebase's own Motion-based components elsewhere already avoid raw `window.addEventListener('scroll', ...)`for exactly the jank/re-render reasons the anti-slop skill flags; follow that existing precedent).
- Content: `Day {day} of {totalDays} · Phase {phaseNum}` in `--font-mono`, small, pinned just below the navbar (check z-index conventions already in use — `StatusTicker`/`Navbar` presumably already occupy this area; the new breadcrumb should sit in a coordinated position, not overlap).
- Respect `prefers-reduced-motion` for its enter/exit transition (fade, not slide, and instant under reduced motion).

**Acceptance criteria:**
- [ ] Scrolling down a long lesson past the masthead reveals the breadcrumb; scrolling back to the top hides it again.
- [ ] Breadcrumb shows correct day/total/phase for the current lesson (verify against a lesson in a lettered-subpart day, e.g. Day 11B, to confirm the day label renders correctly and doesn't break on non-integer-looking day tokens — check `dayTokenToProgressId`/`normalizeDayToken` usage elsewhere in the codebase for the correct way to format these).
- [ ] Doesn't visually collide with the existing `ScrollProgress` bar or `Navbar`/`StatusTicker` — check actual rendered z-index/position stacking, don't assume.
- [ ] No `window.addEventListener('scroll', ...)` introduced — verify the implementation uses `IntersectionObserver`.

**Effort:** M.

---

## Phase 6 — Progress dashboard: read like a monitoring dashboard

### 6.1 Streak as block glyphs (reuse Phase 4's extracted helper)

**Why:** the dashboard's completion streak (`ProgressDashboard.tsx` line 233, currently a plain `<AnimatedCounter value={completionStreak} />`) could use the same filled/unfilled mono block treatment `StatusTicker` already established, rather than being a bare number in one spot and a block-glyph row in another (the navbar) for the same underlying concept.

**File: `src/pages/ProgressDashboard.tsx`** — in the "Day Streak" mobile stat card (line 230–236) and/or the "Completion Streak" analytics stat (line 352–357... check exact current line numbers after Phase 0–5 edits), render the streak using the shared `streakBlocks()` util from Phase 4, alongside (not necessarily instead of) the numeric counter — the numeric value is still useful for streaks >7 where the block row saturates.

**Acceptance criteria:**
- [ ] Streak display uses the shared `streakBlocks` helper (imported, not reimplemented).
- [ ] Long streaks (>7 days) don't produce a nonsensical or overflowing block row — check `streakBlocks`'s existing `max = 7` cap behavior and confirm it's the right UX here too (a numeric value alongside makes the cap acceptable — verify this reads correctly rather than looking like a bug at streak=8+).

**Effort:** S (mostly reuse from Phase 4 — do not do this before Phase 4's extraction).

### 6.2 Terminal-style recent activity log

**Why:** per the ideas doc, alongside or instead of purely visual stats, a scannable text log (`Day 42 completed · 2h ago`) reinforces the "systems dashboard" framing better than stat tiles alone.

**File: `src/pages/ProgressDashboard.tsx`**

- Data source: `completionDates: Record<number, string>` already exists in `progressStore.ts` (day → completion date string, `toDayKey` format — check the exact format used, e.g. `YYYY-MM-DD`). Sort completed lessons by completion date descending, take the most recent 5–10, and render as a mono list: `Day {day}: {lesson.title} · completed {relativeTime}`.
- Relative time formatting: check whether a relative-time util already exists in the codebase (grep for "ago" or a date-fns/dayjs-style dependency) before writing a new one — reuse if present.
- Place this as a new section, likely between the existing "Learning Analytics" and "Needs Review" sections (or wherever reads best given the final page flow after Phase 6.1's changes) — use the same `section` + `section-header` pattern already established for every other block on this page (`gamification-card`, `learning-analytics-card`, `mastery-review-card` are the existing precedents to match structurally: `<section className="..." aria-labelledby="...">`).

**Acceptance criteria:**
- [ ] New "Recent Activity" section lists the most recently completed lessons with real day/title/relative-time data, matching the existing section markup pattern (semantic `<section>`, heading, consistent spacing).
- [ ] Empty state: a user with zero completions doesn't see a broken/empty section — either hide the section entirely (matching how "Needs Review" already conditionally renders only `{reviewLessons.length > 0 && (...)}`, line 399) or show an on-brand empty message consistent with Phase 1.1's terminal-flavored empty states.
- [ ] Uses `tabular-nums` for the day numbers, mono font throughout, consistent with the rest of the page's existing stat treatments.

**Effort:** M.

### 6.3 Richer heatmap cell tooltips

**Why:** the existing heatmap (`ProgressDashboard.tsx` lines 121–151) already works well per the audit — the only gap is that hover info is a native `title` attribute (line 138), which is minimal (no styling, delayed, inconsistent across browsers/OSes) versus a proper on-brand tooltip with title/time-spent/mastery status.

**File: `src/pages/ProgressDashboard.tsx`** + a tooltip component (check whether one already exists in the codebase — grep for "Tooltip" — before building a new one; several component libraries or hand-rolled tooltip patterns may already exist for e.g. `badge-chip`'s `title` attribute at line 323, which has the same limitation and might be worth fixing in the same pass if a shared solution is built).

- Replace the native `title` on `.heatmap-cell` with a custom hover/focus-triggered tooltip showing: lesson title, day, completion status, and time spent (`timeByLessonDay[day]` from `useLearningAnalyticsStore`, formatted via `formatDuration`).
- Must work via keyboard focus too, not just mouse hover (the cells are already `<Link>` elements, which are natively focusable — the tooltip needs to respond to `:focus-visible` as well as `:hover`).

**Acceptance criteria:**
- [ ] Hovering or focusing a heatmap cell shows a styled (not native-browser) tooltip with title, day, status, and time spent.
- [ ] Keyboard-only navigation (Tab through cells) triggers the same tooltip on focus.
- [ ] Tooltip is dismissed/repositioned correctly near viewport edges (doesn't clip off-screen for cells near the sidebar or right edge).
- [ ] No regression to the existing `sr-only` text (line 140–142) that already gives screen readers the same information via a different mechanism — verify both mechanisms coexist without duplicate/conflicting announcements.

**Effort:** M (tooltip positioning/focus-handling is fiddlier than it looks — budget real time for edge cases).

---

## Phase 7 — Exercises: real filterable table view

**Why:** Exercises is "the one surface in the app that's genuinely data-dense and currently under-serves that with a card grid" per the audit. `Exercises.tsx` already has full filter/sort logic (phase filter, difficulty filter, keyword search, 3 sort orders — lines 50–100) — this phase is a **rendering change**, not new data logic.

**Decision needed before implementing (recommend, but flag for confirmation if genuinely ambiguous once you're in the code): table as the only view, or table as a toggle alongside the existing card grid?** The existing `ExerciseCard` component may carry visual richness (icons, difficulty color, etc.) that a dense table would flatten. Recommend adding a view toggle (`MapListToggle.tsx` already exists in the codebase as a precedent for exactly this kind of dual-view pattern used on Home — check its implementation and reuse the same toggle UI/interaction convention) rather than deleting the card view outright, since both view provides now serve different purposes: cards for browsing/discovery, table for power-user filtering.

**File: `src/pages/Exercises.tsx`**

- Add a table rendering path alongside the existing `ExerciseCard` grid, toggled the same way `MapListToggle` toggles Home's phase grid vs. concept graph.
- Table columns: Day (tabular-nums, mono), Title, Phase, Difficulty (colored badge, matching existing `difficultyConfig` colors — already used elsewhere, don't invent new difficulty colors), Status (done/not, reusing the sidebar's `✓`/`·` glyph convention for visual consistency across the app), and a link/action to open the lesson.
- Sortable by clicking column headers (Day, Phase, Difficulty at minimum) — wire this into the existing `sortOrder` state rather than creating a parallel sort mechanism; extend the `sortOrder` union type if new sort keys are needed (e.g. `'difficulty-asc'`).
- All existing filters (phase, difficulty, keyword) apply identically to both views — they already operate on the same `filtered` memoized array; the table just needs to render that same array differently.
- `tabular-nums` on all numeric columns, per the codebase's existing convention (confirmed present in `base.css` line 83, `sidebar.css`, `progress.css` — apply consistently here).

**States to handle:**
- **Empty (no exercises match filters):** already handled by `ExercisesEmptyIllustration` — after Phase 1.1's rewrite, this now renders the terminal-flavored empty state in both card and table views.
- **Loading:** exercises are loaded synchronously from bundled content (`getAllExercises()`), so there's likely no async loading state needed here — verify this assumption by checking `contentLoader.ts` before assuming a loading skeleton is required.

**Acceptance criteria:**
- [ ] A view toggle switches between the existing card grid and a new table, using the same interaction pattern as `MapListToggle`.
- [ ] Table is sortable by at least Day and Difficulty via clickable headers, with a visible sort-direction indicator (reuse Phosphor's caret/arrow icons, consistent with `CaretRight` already used in `SidebarPhaseGroup`).
- [ ] Filtering (phase/difficulty/keyword) works identically in both views.
- [ ] Keyboard accessible: sortable headers are real `<button>`s (not `<div onClick>`), with `aria-sort` attributes reflecting current state.
- [ ] Mobile: table view either horizontally scrolls in a contained way or the toggle defaults to card view below a breakpoint (a dense multi-column table on a narrow viewport is a real usability regression if not handled — decide and document which approach, don't ship an unresponsive table).
- [ ] `pnpm run typecheck` and existing Exercises tests (check `tests/unit/` for an `Exercises.test.tsx` or similar) still pass — update tests to cover the new view if the existing suite only covers the card grid.

**Effort:** L.

---

## Phase 8 — Curriculum page: sidebar-consistent tree language (lower priority)

**Why:** listed last because it's the most purely aesthetic/consistency-driven item and the lowest-confidence one — `Curriculum.tsx` is already a well-built timeline (scroll-linked progress line via Motion, per-phase progress bars, difficulty badges), not a generic card grid as the original ideas doc implied. Re-read the actual current implementation (already done above) before assuming this needs a rebuild.

**Revised recommendation given what the current `Curriculum.tsx` actually is:** rather than replacing the timeline with the sidebar's file-tree visual language wholesale (which would be a regression — the timeline's scroll-linked progress line is a nice touch not present in the sidebar), the actual consistency gap is narrower: verify shared visual primitives (phase number formatting, difficulty badge styling, progress-bar component) are genuinely shared components/tokens between `Curriculum.tsx`, `Sidebar.tsx`, and `PhaseOverview.tsx`, rather than three parallel implementations that happen to look similar. **This needs a real audit pass (grep for duplicated formatting logic like `String(phase.phase).padStart(2, '0')`, which currently appears independently in at least `Sidebar.tsx`, `SidebarPhaseGroup.tsx`, and `Curriculum.tsx`) before deciding what, if anything, to change visually.** If the audit finds only harmless small duplication, the right fix may be "extract a shared `formatPhaseNumber()` util" rather than any visual redesign at all.

**Acceptance criteria (audit-first, not a fixed visual target):**
- [ ] Document every place `String(phase.phase).padStart(2, '0')` (or equivalent phase-number formatting) is duplicated.
- [ ] Document every place difficulty badge styling (`difficultyConfig[...]`, inline `style={{ color, background }}`) is duplicated vs. componentized.
- [ ] Propose (and only then implement) either a shared util/component extraction, or a genuine visual change — pick based on what the audit actually finds, not on the original doc's untested assumption that Curriculum is "just a card grid."

**Effort:** S for the audit, unknown/TBD for whatever it recommends — do not commit to implementation scope for this phase until the audit is done.

---

## Cross-phase verification checklist

Run before considering *any* phase done:

- [ ] `pnpm run typecheck` passes.
- [ ] `pnpm run format:check` passes (or `pnpm run format` if it doesn't, then re-check the diff is what you expect).
- [ ] `pnpm run test` passes; update/add tests for any component whose props, rendered output, or store schema changed (Phase 0.1's palette schema change and Phase 2's `SearchPalette` changes are the most likely to have existing test coverage that needs updating — search `tests/unit/` for references before assuming there's nothing to update).
- [ ] `pnpm run build` succeeds.
- [ ] Manually verify in a real browser (not just unit tests) for any visual change — this codebase's own session history shows a pattern of "tests pass but visual regression slipped through" being caught by manual browser verification; don't skip it.
- [ ] For every new/changed color: check it resolves through a `var(--...)` token, not a literal hex, unless it's a documented deliberate exception (like Phase 0.1's `high-contrast` palette).
- [ ] For every new animation/transition: verify `prefers-reduced-motion: reduce` behavior explicitly (OS setting or DevTools emulation), don't assume the existing token system (`--motion-duration-active-*`) automatically covers a hand-rolled animation that doesn't reference those tokens.
- [ ] For every new interactive element: keyboard-only pass (Tab, Enter, Escape, arrow keys as applicable) and a quick screen-reader spot-check (VoiceOver/NVDA, or at minimum verify sensible `aria-*` attributes and accessible names are present).

---

## Explicit non-goals for this spec

Do not do any of the following as part of implementing the phases above — they're either out of scope, already decided against, or belong to a different, separately-scoped effort:

- Direction B ("Editorial Business Journal") — different color palette, different typography, different navigation metaphor. Not this spec.
- A real numbered-issues content system for Home (decided against above).
- Dotfile-style key:value Settings redesign (decided against above).
- Adding new legacy-style "fun" palettes beyond the 3 specified in Phase 0.1.
- Renaming `SearchPalette.tsx` to `CommandPalette.tsx` (optional, low-value churn — skip unless you're already touching every call site for another reason).
- Any change to URL structure, route slugs, primary nav labels, or existing analytics event names (per the redesign-ideas.md "what never changes silently" rule, which still applies here).
