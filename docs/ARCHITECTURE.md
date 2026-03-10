# Architecture Overview

This document provides a high-level overview of the **Coding for MBA** application architecture.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 7
- **Language**: TypeScript 5.9
- **State Management**: Zustand (for progress and global state)
- **Routing**: React Router (HashRouter)
- **Styling**: Vanilla CSS + CSS Variables (Design System)
- **Testing**: Vitest (Unit) + Playwright (E2E)
- **Deployment**: GitHub Pages

## 🧩 Core Concepts

### 1. Content Loading (`src/utils/contentLoader.ts`)

The application loads curriculum content (Markdown files) using Vite's `import.meta.glob` feature. This allows us to:
- Load all lesson and phase markdown files at build time.
- Parse Frontmatter metadata (day, title, difficulty) using a custom parser.
- Expose immutable accessors (`getAllLessons`, `getLesson`, `getAllPhases`) to the rest of the app.
- Cache the parsed content for performance.

### 2. Markdown Rendering (`src/components/MarkdownRenderer.tsx`)

We use `react-markdown` to render lesson content. The renderer is customized to:
- Sanitize HTML output using `rehype-sanitize`.
- Support GitHub Flavored Markdown (GFM).
- Render custom interactive components for specific markdown patterns:
  - **Code Blocks**: Enhanced with `CodePlayground` or `SyntaxHighlighter`.
  - **Exercises**: Parsed from `### Exercise` headers and rendered as `ExerciseWidget`.
  - **Mastery Checks**: Parsed from `<details>` blocks and rendered as `MasteryCheck` widgets.
  - **Glossary**: Automatically detects key terms and wraps them in tooltips.

### 3. Pyodide Integration (`src/components/PythonRunner.tsx`)

The application includes a browser-based Python environment using **Pyodide**.
- **Execution**: Python code runs entirely in the browser (WebAssembly).
- **Security**:
  - We use `src/utils/codeSecurity.ts` to validate user code before execution.
  - Dangerous imports (`os`, `sys`, `subprocess`) and functions (`exec`, `eval`) are restricted.
  - Direct access to the JavaScript DOM (`import js`) is blocked.
- **Performance**: Pyodide is loaded lazily and cached.

### 4. State Management (`src/stores/progressStore.ts`)

We use **Zustand** to manage user progress and application state.
- **Persistence**: Progress (completed lessons, XP) is persisted to `localStorage`.
- **Synchronization**: The store syncs state across tabs using storage events.

### 5. Navigation & Routing

- **HashRouter**: We use hash-based routing (`/#/lesson/1`) to ensure compatibility with GitHub Pages.
- **Sidebar**: The `Sidebar` component dynamically generates navigation based on the loaded phases and lessons.
- **Day Tokens**: Lessons are identified by "Day Tokens" (e.g., `1`, `36B`) allowing for flexible curriculum expansion without renumbering everything.


## 📂 Directory Structure

See `CONTRIBUTING.md` for a breakdown of the project structure.
