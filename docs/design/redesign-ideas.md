# Redesign Ideas — Coding for MBA

**Status:** Idea collection, not a spec. Nothing here is approved or scheduled. Pull individual ideas into their own design/PR when you're ready to act on them.

**How this was produced:** researched the live app and its design tokens (`src/styles/variables.css`, `src/styles/*.css`), screenshotted Home/Sidebar/Lesson/Progress/Exercises/Content Stats/Settings, and ran it through two design-critique skills — a taste/anti-slop skill calibrated for landing pages and a general anti-UI-slop audit. Scope: whole app, prioritized. Ambition: blue-sky — effort is noted per idea, not used as a filter. Architecture is open to change if an idea earns it.

**Bug fixed along the way (not an idea, already shipped):** the curriculum is 163 days, but a dozen+ places — SEO meta tags, JSON-LD, the sidebar brand line, `index.html`, `manifest.json`, `README.md` — hardcoded "140-day" or "145-day" (stale from before Phases 10–12 were added). Fixed to read from `getCurriculumMetadata().totalDays` dynamically wherever the code already runs in that context, and corrected the truly-static files (`index.html`, `manifest.json`) to the current value. Phase 12's day *labels* (Day 138–145) are untouched — those are correct; the curriculum has 163 lessons but the last day *label* is 145 because several days have lettered sub-parts (11B, 24C, 36B/C, etc.).

---

## 1. What's already here

The app has a real, deliberate design system — `variables.css` literally names it *"The Analyst's Terminal."* This is worth stating up front because it means the honest brief for Direction A below is "sharpen," not "fix":

- **Palette:** near-black ink + warm off-white "bone" + a single signal-lime accent (`#d4ff3f`), used surgically. No gradients except one radial backdrop on the concept graph.
- **Type:** Fraunces (serif, display *and* body) × JetBrains Mono (all UI chrome) — an unusual, distinctive pairing, not a default reach.
- **Shape language:** near-sharp corners (2–10px radius), hairline borders instead of shadows, "brutalist edges" per the token comments.
- **Motion:** restrained, 150–360ms, respects `prefers-reduced-motion` throughout.
- **Icons:** Phosphor (migrated this session), plus an intentional mono-glyph tree in the sidebar (`~ ▣ ✎ ⚙ ▤ λ ▦`) — explicitly documented in `Sidebar.tsx` as "no emoji icons."
- **Content-aware architecture:** plain CSS custom-property tokens, no Tailwind/CSS-in-JS, per-feature stylesheets (`sidebar.css`, `lesson.css`, `progress.css`, …).

This already avoids nearly every default AI-slop tell (no Inter, no AI-purple, no filler-verb copy, no generic three-card grids). The ideas below are refinement and expansion, not triage.

### Small inconsistencies found while researching (not full ideas, just noted)

- **`⌘K` is promised, not built.** `NotFound.tsx` tells users to press `⌘K` to "open the command palette" — no such feature exists anywhere in the codebase. This is either a broken promise to cut, or (see Direction A) the single most on-brand feature this identity is missing.
- **The Settings palette picker only offers the *pre-rebrand* palettes.** Seven legacy candy-colored options (Peach Sorbet, Neon Party, Gradient Blues, Deep Ocean Blue, Pastel Dreamland, Golden Summer Fields, Light Steel) are selectable; the actual current identity (Terminal Dark / Bone Light) isn't offered as a choice there at all — see §4.
- **PWA `theme-color` is `#4361ee`** (a blue) in both `index.html` and `manifest.json` — doesn't match the signal-lime brand anywhere else. One-line fix, low priority.
- **`.glass-card` is a stale class name**, not a live bug — the CSS under it was already flattened to hairline borders (`backdrop-filter: none`, comment says "formerly glass"). Renaming the class to `.stat-tile` or similar is a trivial cleanup, not a visual fix.

---

## 2. Direction A — Preserve & Refine

**Philosophy:** the identity is good. Don't replace it — make it show up in more places, and close the gaps where it's inconsistently applied.

### 2.1 Cross-cutting

- **Build the command palette the app already promises.** A real `⌘K` Spotlight/Raycast-style overlay — jump to any lesson/phase/exercise, run "mark day N complete," toggle reading mode, jump to Settings. This is the single feature most on-brand for a "workstation" identity and currently doesn't exist. `SearchPalette.tsx` already exists in the codebase as an unused/orphaned component (not wired into any route) — worth checking whether it's a half-built start on exactly this.
- **Fix the Settings palette picker** (detail in §4) — make Terminal Dark / Bone Light the prominent, obviously-current choices.
- **Terminal-flavored empty/error/loading states.** Replace generic spinners and illustration-based empty states with the vocabulary the rest of the app already uses: a blinking-cursor loading indicator instead of a spinner; `$ no results for "query"` prompt-style empty states in Search/Exercises; a boot-sequence-style skeleton (lines resolving top-to-bottom, like a terminal printing output) for lesson content loading instead of generic shimmer blocks.
- **PWA theme-color fix** — `#4361ee` → the signal-lime or ink token. One line in two files.

### 2.2 Home

- **Push the "terminal" framing further into the hero.** The `StatusTicker` (top bar) already sells "live system" — extend that language into the hero itself: a small "uptime"-style readout (`SESSION: 00:14:32 · STREAK: 3d · LAST SYNC: 2m ago`) sitting near the CTA, reinforcing that this is a tool you *run*, not a page you *read*.
- **"Issue 01" numbering is a nice editorial touch that's currently a dead end.** Either commit to it (a real "issues" concept — e.g. each week's new content drop gets a numbered issue, with an archive) or drop it; right now it reads as a one-off flourish with no system behind it.

### 2.3 Sidebar / Navigation

- **Real git-status-style indicators.** The sidebar is already file-tree-styled (VS Code-inspired); lean in further — a modified/staged-style dot next to phases with in-progress lessons (distinct from the existing "done" checkmark), matching the metaphor instead of a generic progress bar.
- **Collapsible-by-default for completed phases**, auto-expanding the current one — the file tree gets long at 12 phases and this is a common "how do I navigate a big project" pattern the metaphor already implies.

### 2.4 Lesson reader

- **Editorial callouts, terminal-flavored.** Check current MarkdownFragment rendering of admonitions/callouts — if they're generic colored boxes, restyle as terminal-style annotations (`# NOTE:`, `# WARNING:` prefixes in mono, hairline left-border instead of a filled background).
- **A real reading-progress affordance beyond the top bar** — e.g. a persistent, subtle "Day 12 of 163 · Phase 2" breadcrumb that stays visible while scrolled deep into long lessons (some lessons are long enough that users lose track of where they are in the curriculum).

### 2.5 Progress dashboard

- **Make it read like a monitoring dashboard, not a stats page.** Sparklines for the last-7-days chart (already exists as a bar chart — a sparkline treatment would feel more "systems dashboard"); an uptime-style streak counter rendered as a row of filled/unfilled mono block characters (`■■■□□□□`), not emoji, consistent with the existing icon rule; a terminal-style "recent activity log" (`Day 42 completed · 2h ago`) instead of/alongside the heatmap.
- **The heatmap already exists and is good** — consider making individual cells hoverable with a richer tooltip (title, time spent, mastery status) rather than just a native `title` attribute.

### 2.6 Settings

- See §4 for the palette-picker fix specifically.
- **Group "Appearance" more like a config file.** The current grouped-card layout is fine; a bolder on-brand version would present settings as a `key: value` list in mono with inline editable values — closer to editing a dotfile than filling out a form. (Higher effort, debatable whether it's worth the accessibility cost of a non-standard form pattern — flagging as an idea to stress-test, not a clear win.)

### 2.7 Exercises / Curriculum / Phase overview

- **Exercises browser as a real filterable table**, not just cards — sortable by phase/difficulty/accuracy, mono-aligned numeric columns (tabular-nums is already a documented rule in `base.css`). This is the one surface in the app that's genuinely data-dense and currently under-serves that with a card grid.
- **Curriculum page's phase list could adopt the same file-tree visual language as the sidebar** for consistency, rather than being a separate card-based layout.

---

## 3. Direction B — "Editorial Business Journal"

**Philosophy:** a genuinely different, still-credible-for-this-audience direction. The current design already has a faint magazine thread (Fraunces serif, "ISSUE 01" numbering) — push it all the way to a real publication feel: The Economist, Bloomberg Businessweek print edition, Stripe Press. Business professionals respond well to "serious publication" cues; this isn't a random genre swap, it's pulling a thread that's already there.

**Why this and not something else:** it stays credible to an MBA audience (unlike, say, a colorful playful direction), it doesn't just make Direction A's territory louder (a "cockpit/instrument-panel" direction would be redundant with what Progress/Stats already do), and going **light-first** where Direction A is dark-first means these two are genuinely different things to react to, not two dark themes with different jargon.

### 3.1 Foundations

- **Palette:** warm paper background (`#faf6ec`-ish — the app's own `--bone-50` primitive is already a good starting point), near-black ink text, a single restrained accent — not lime; something that reads "editorial," e.g. a deep masthead red or ink-blue used the same "surgically" way the current lime is.
- **Type:** replace Fraunces (which the taste skill flags as an overused AI-default serif, even though it's used with intent here) with a different editorial serif to differentiate this direction from Direction A. Practical, Google-Fonts-available recommendation: **Newsreader** (explicitly designed to evoke NYT-style reading experiences, free, self-hostable via `@fontsource` exactly like the current setup). If budget for a licensed font ever exists: Tiempos Headline, Domaine Display, or Canela are closer to true Businessweek/Economist territory. Pair with a geometric grotesk sans (Space Grotesk, Archivo, or Public Sans — all free) for UI chrome and bylines, replacing JetBrains Mono's role; keep a light mono *only* for tabular numerals in stats.
- **Shape/materiality:** hairline rule dividers instead of card borders wherever possible — the editorial page doesn't box everything in cards, it separates sections with a rule and whitespace.

### 3.2 Home

- **Masthead-style header** instead of the current navbar — publication name as a wordmark, issue/date line, then the hero as a genuine "cover story": large headline, deck (subhead), byline-style metadata line (`163 Days · 12 Phases · Updated Weekly`).
- **"Table of contents" front page** — instead of (or alongside) the current hero + stat tiles, a genuine magazine-front layout: one large "lead story" (Continue where you left off), several smaller "sections" (Curriculum, Progress, Notes) laid out as a real editorial grid, not equal-sized cards.

### 3.3 Navigation

- **Sidebar becomes a table of contents**, not a file tree — phase numbers styled like chapter numbers, lessons listed like an index, no `~ ▣ ✎` glyphs (those are explicitly part of the terminal metaphor and wouldn't survive the swap). Top-level sections (Curriculum, Notes, Progress, Settings) styled as a masthead nav bar, not a workspace panel.

### 3.4 Lesson reader

- **This is where the direction pays off most.** Byline-style lesson headers: `DAY 12 · FUNCTIONS, MODULARITY & DATA WRANGLING · 9 MIN READ`, in small-caps or letterspaced sans, above a genuine serif headline. Pull-quote treatment for key callouts (large serif, indent, thin left rule) instead of colored admonition boxes. Drop caps on lesson intros. Code blocks stay monospace (that's a code-block need, not a metaphor choice) but get an editorial "figure" treatment — captioned like a chart or exhibit in a business article, not a terminal window.

### 3.5 Progress / Exercises / Curriculum

- **Curriculum page as a real magazine contents page** — phase numbers as large display numerals (the app already has a `clamp()`-based huge-numeral pattern for the 404 page; reuse that instinct here), phase titles as section headers, a rule between each.
- **Progress dashboard as an "annual report" page** — the existing stat-tile grid translates well here almost unchanged (big numbers, small labels is already an editorial pattern), but the heatmap could become a printed-calendar-style grid (like a GitHub contributions graph redrawn in the editorial palette) rather than a terminal-style grid.

---

## 4. Cross-cutting decision: the 7 legacy palettes

Not resolving this — laying out the actual tradeoff, since it affects both directions.

**The problem:** `variables.css` documents Terminal Dark and Bone Light as the two *current* palettes. The other 7 (`peach-sorbet`, `gradient-blues`, `neon-party`, `deep-ocean-blue`, `pastel-dreamland`, `golden-summer-fields`, `light-steel`) are explicitly commented as "preserved for backward compatibility" — pre-rebrand leftovers. The Settings UI currently shows *only* those 7, not the 2 current ones, which is almost certainly an oversight rather than a decision.

**Option 1 — Retire them.** Remove from the picker (keep the CSS so any user with one saved in `localStorage` doesn't see a broken app, just stop offering them going forward). Cleanest brand story; loses nothing for new users; existing users on a legacy palette keep what they have until they change it.

**Option 2 — Keep them, but demote.** Terminal Dark / Bone Light shown first and large ("Current"); legacy 7 shown under a collapsed "More palettes" or "Legacy" section. Preserves user choice/nostalgia, fixes the immediate bug (current palettes now *are* selectable), costs a small amount of Settings-page complexity.

**Option 3 — Replace them with new, on-brand alternatives.** Keep the *idea* of multiple palettes (some users clearly want that) but design 2–3 new ones that fit the actual current design language instead of pre-rebrand candy colors — e.g. a warm "Paper Terminal" (bone-light with the mono/hairline system intact), a high-contrast accessibility mode. Most work, most coherent end state.

My lean: **Option 2 short-term** (it's a near-zero-cost bug fix — the current palettes should never have been absent from the picker), **Option 3 as a longer-term follow-up** if palette variety turns out to matter to users.

---

## 5. Suggested rough sequencing (not a commitment — for prioritization conversations only)

1. Settings palette-picker fix (§4, Option 2) — smallest effort, fixes a real bug, ships regardless of which direction (or neither) you pursue further.
2. PWA theme-color fix — one line, two files.
3. Command palette (§2.1) — biggest single feature gap, high effort, but it's the most requested-by-implication feature (the copy already promises it).
4. Everything else in Direction A — incremental, can ship piecemeal per surface without a big-bang redesign.
5. Direction B — the only item here that's genuinely "new project" scale. Would want its own brainstorming pass (new tokens, a proof-of-concept on one page like Home or a single Lesson before committing further) rather than treating it as a checklist.
