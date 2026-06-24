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

## Runnable SQL blocks 🔲

The Python "▶ Try It" playground (via Pyodide) is a flagship feature, but
Phases 7–9 are SQL-heavy with zero interactivity for SQL snippets. `sql.js`
(WASM SQLite) could power an equivalent "▶ Try It" for ` ```sql ` blocks,
reusing the existing `CodeBlock` UI shell.

## Mastery Check upgrade: from "click to reveal" to actual self-test 🔲

Mastery Check questions are currently just `<details>` reveal toggles. Since
`progressStore`/`gamificationStore` already exist, this is a natural
extension point:

- Track per-question "got it / review again" feedback, persisted to a store.
- Surface a small "3/5 mastered" badge in the TOC or lesson header.
- Surface lessons with low mastery scores for revisiting (lightweight
  spaced-repetition nudge) on the home/progress pages.

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

## Reading-mode / navigation polish 🔲

- **Heading anchor click-to-copy**: make `.heading-anchor-link` copy the full
  URL and fire the existing `toastSuccess` (pattern already used in
  `Lesson.tsx`), instead of just navigating the hash.
- **Sticky "answered X/Y mastery checks" mini progress bar** while scrolling,
  complementing the existing `nearBottom`/`reading-mode` logic.
- **In-page search ("/" to search this lesson)** with match highlighting and
  next/prev jump.

## Table & image polish 🔲

- Add a subtle fade/gradient edge indicator when a table overflows
  horizontally inside `TableComponent`'s scroll wrapper.
- Render `ImageWithZoom`'s `alt` text as a visible `<figcaption>` below the
  image — many lesson diagrams currently have no visible caption at all.

## Content-authoring safety nets 🔲

A lint rule (could live in `scripts/validate-content`) that checks every
`### Exercise N` has a `**Goal**` and code block, and every `### Question N`
has a `<details>` block — `findInteractiveBlocks` already encodes these
structural assumptions; validating them at build time would prevent silently
unparsed exercises.
