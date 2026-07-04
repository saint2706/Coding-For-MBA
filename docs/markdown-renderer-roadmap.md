# Markdown Renderer: Feature Roadmap

Brainstormed ideas for evolving `src/components/MarkdownRenderer.tsx` and its
supporting pieces (`TableOfContents`, glossary tooltips, `CodePlayground`,
the sanitizer schema, `content-features.css`). The renderer already supports
Pyodide-backed Python playgrounds, glossary tooltips, image zoom, KaTeX math,
slugged heading anchors, exercise/mastery-check parsing, and FAQ schema
generation. This doc tracks what's next.

Status legend: ✅ implemented · 🔲 not yet started

## Callouts / admonitions ✅

Lessons already write semi-structured asides ("Senior-Level Insights", pitfalls,
pro tips) as plain headings or blockquotes, with no distinct visual treatment.
GitHub-style `> [!NOTE]` / `[!TIP]` / `[!WARNING]` / `[!DANGER]` / `[!IMPORTANT]`
markers let authors mark these asides and get distinct colored boxes for free.

Implemented via a remark plugin (`src/utils/remark-callouts.ts`) that detects
the marker in the first paragraph of a blockquote and re-tags the node as
`<div class="callout callout-{type}" data-callout="{type}">`, styled in
`markdown.css`.

## Mobile-tappable glossary tooltips ✅

The glossary tooltip (`content-features.css` `.glossary-term`) was hover-only,
which is dead on touch devices — a real gap given this is a learning site
likely read on phones. Glossary terms are now rendered via a small
`GlossaryTerm` component (`src/components/GlossaryTerm.tsx`) that renders a
`<button>` supporting tap-to-toggle (with outside-tap/Escape dismiss), while
still supporting `:hover` on pointer devices.

## Mermaid diagrams ✅

Implemented via a `mermaid` code-block detector in `CodeComponent` (parallel
to the existing Python/Pyodide path): a ` ```mermaid ` fence renders through
`MermaidBlock` instead of the syntax-highlighted `CodeBlock`, with a header
toggle to flip between the rendered diagram and the raw source (plus the
usual copy button). The actual diagram rendering is lazy-loaded via
`src/components/MermaidDiagram.tsx` (`React.lazy` + dynamic `import('mermaid')`),
so the library only enters the bundle for lessons that use it. Mermaid runs
with `securityLevel: 'strict'` and renders sanitized SVG client-side via
`mermaid.render()`; the diagram theme (`dark`/`default`) tracks the app's
`data-palette-type` attribute via a `MutationObserver`, and parse/render
failures fall back to an inline error message with the raw diagram source
instead of crashing the lesson.

## Runnable SQL blocks ✅

Implemented via `sql.js` (WASM SQLite), bundled through npm rather than CDN
so no CSP changes were needed. `src/hooks/useSqlJs.ts` lazily initializes the
WASM module behind a module-level singleton promise (mirroring the
`usePyodide` loading pattern) and exposes a `runSql` helper that opens a
fresh in-memory database per query and closes it afterwards. `CodeBlock`'s
"▶ Try It" button now triggers for ` ```sql ` fences as well as Python,
rendering a lazy-loaded `SqlPlayground` (`React.lazy` + dynamic import, same
code-splitting approach as `MermaidDiagram`/`CodePlayground`) with an editable
textarea, syntax highlighting (`sql` registered in `src/utils/prism.ts`), and
Shift/Ctrl/Cmd+Enter execution. Results render through `SqlRunner` as one
table per statement, with `NULL` cells styled distinctly and large result
sets capped at 200 displayed rows.

## Mastery Check upgrade: from "click to reveal" to actual self-test ✅

Mastery Check questions now track real self-assessment instead of just
reveal toggles. A new persisted Zustand store, `src/stores/masteryStore.ts`,
records a "got it" / "review again" status per lesson/question pair (keyed
by `normalizeDayToken(lessonId)`, matching the identifier scheme already
used to resolve lessons via `contentLoader`). `MasteryCheck.tsx` accepts an
optional `lessonId` prop — threaded through `MarkdownRenderer` from
`Lesson.tsx` — and renders "Got it 👍" / "Review again 🔁" buttons once the
answer is revealed, persisting the choice when a `lessonId` is present and
falling back to local component state otherwise. The lesson header in
`Lesson.tsx` shows a "🎯 N/M mastered" badge next to the existing "Mark
complete" control, and `ProgressDashboard.tsx` surfaces a "Needs Review"
section listing lessons with outstanding "review again" answers, sorted by
review count, as a lightweight spaced-repetition nudge.

## Code block QoL ✅

- **Diff highlighting**: a remark plugin (`src/utils/remark-code-meta.ts`)
  reads the fence's meta string for a `diff` keyword (or a bare ` ```diff `
  language) and tags the mdast `code` node with `data-diff`. `CodeBlock` (in
  `MarkdownRenderer.tsx`) uses `react-syntax-highlighter`'s `lineProps` to
  color `+`/`-` prefixed lines green/red (skipping unified-diff `+++`/`---`
  file headers) and shows a small "diff" badge when the language itself isn't
  `diff`.
- **Download/copy whole lesson's code**: `src/utils/lessonCodeBlocks.ts`
  extracts every runnable `python`/`py` fence from a lesson's markdown
  (skipping `diff`-flagged ones), and `LessonCodeActions`
  (`src/components/LessonCodeActions.tsx`) renders "Copy all snippets" and
  "Download as .py" buttons in the lesson header.
- **Per-exercise "copy starter code"**: `ExerciseWidget` now has a "Copy
  starter code" button (via the shared `CopyButton`) that copies the original
  `starterCode` prop, independent of any live edits in the playground.
- **Line highlighting**: the same `remarkCodeMeta` plugin parses a
  ` ```python {3,7-9} ` meta range and tags the node with
  `data-highlight-lines`, which `CodeBlock` turns into highlighted lines via
  `lineProps`.

## Reading-mode / navigation polish ✅

- **Heading anchor click-to-copy**: `.heading-anchor-link` now copies the full
  URL via the Clipboard API and fires the existing `toastSuccess` (pattern
  already used in `Lesson.tsx`), instead of just navigating the hash.
- **Sticky "answered X/Y mastery checks" mini progress bar** while scrolling,
  complementing the existing `nearBottom`/`reading-mode` logic.
- **In-page search ("/" to search this lesson)** with match highlighting and
  next/prev jump, implemented in `src/components/LessonSearch.tsx`.

## Table & image polish ✅

- `TableComponent` (`src/components/MarkdownFragment.tsx`) now renders a
  two-layer wrapper: an outer `.table-wrapper` that hosts `::before`/`::after`
  gradient fades pinned to the left/right edges, and an inner `.table-scroll`
  that actually scrolls (keeping the fade fixed instead of scrolling away
  with the table). A `ResizeObserver` plus scroll/resize listeners track
  whether the table overflows on each side and toggle
  `data-overflow-left`/`data-overflow-right` attributes that drive the fade
  opacity in `markdown.css`.
- Standalone `![alt](src)` images are promoted from a plain paragraph to a
  `<figure>` with a visible `<figcaption>` showing the alt text below the
  image. Since remark always wraps a solo image in a `<p>`, and a `<figure>`
  can't nest inside a `<p>`, `ParagraphWithGlossary` detects when its only
  child is the `ImageWithZoom` component and renders `<figure>` instead of
  `<p>` in that case, rather than wrapping figure/figcaption around the img
  itself. Images with no alt text (or mixed with other inline content) fall
  back to the previous plain rendering with no caption.

## Content-authoring safety nets 🔲

A lint rule (could live in `scripts/validate-content`) that checks every
`### Exercise N` has a `**Goal**` and code block, and every `### Question N`
has a `<details>` block — `findInteractiveBlocks` already encodes these
structural assumptions; validating them at build time would prevent silently
unparsed exercises.
