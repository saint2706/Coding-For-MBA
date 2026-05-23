# Coding for MBA

> A structured 140-day interactive learning platform covering Python, Data Science, Machine Learning, Business Intelligence, Enterprise SQL, Generative AI, Cloud Data Engineering, and Analytics Engineering — designed for business professionals.

[![Deploy](https://github.com/saint2706/Coding-For-MBA/actions/workflows/deploy.yml/badge.svg)](https://github.com/saint2706/Coding-For-MBA/actions/workflows/deploy.yml)
[![CI](https://github.com/saint2706/Coding-For-MBA/actions/workflows/ci.yml/badge.svg)](https://github.com/saint2706/Coding-For-MBA/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite)](https://vite.dev/)

## 🌐 Live Demo

**[saint2706.github.io/Coding-For-MBA](https://saint2706.github.io/Coding-For-MBA)**

## 🚢 Deployment Environments

- **Primary production environment:** GitHub Pages via `.github/workflows/deploy.yml`.
- **Surge (`coding-for-mba.surge.sh`) usage:** optional preview/release deployment, triggered manually (`workflow_dispatch`) or on published GitHub releases.
- **Promotion model (CI → Deploy):**
  1. `CI` (`.github/workflows/ci.yml`) runs on PRs and pushes to `main` and is the canonical gate for linting, type checking, content validation, and test coverage.
  2. `Deploy to GitHub Pages` (`.github/workflows/deploy.yml`) runs automatically only after `CI` completes successfully on `main` (`workflow_run` trigger).
  3. Deploy workflow now performs only deployment-critical tasks (install deps, build artifact, upload, Pages deploy), with no duplicated quality gates.
  4. Manual deploy remains available through `workflow_dispatch` for maintainer-controlled re-deploys.
  5. `Dependency Review` (`.github/workflows/dependency-review.yml`) runs on pull requests to protected branches and blocks dependency updates that introduce high/critical vulnerabilities or unacceptable license/policy changes.

## 📚 What's Inside

| Phase | Topic | Days |
| ----- | ----- | ---- |
| 1 | Python Foundations | 1–12 |
| 2 | Functions & Modularity | 13–24 |
| 3 | Data Engineering & Web Dev | 25–36 |
| 4 | Math & ML Foundations | 37–48 |
| 5 | Advanced ML & Deep Learning | 49–60 |
| 6 | Cutting-Edge ML | 61–72 |
| 7 | BI & Analytics | 73–84 |
| 8 | SQL Mastery | 85–96 |
| 9 | Enterprise SQL | 97–108 |
| 10 | Generative AI & LLM Engineering | 109–120 |
| 11 | Cloud Data Engineering | 121–132 |
| 12 | Analytics Engineering & Data Products | 133–140 |

## 🛠️ Tech Stack

- **Framework**: React 19.2.4 + TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1
- **Routing**: React Router (HashRouter for GH Pages)
- **Markdown**: react-markdown + remark-gfm + rehype-raw
- **Syntax Highlighting**: react-syntax-highlighter (Prism)
- **Styling**: Vanilla CSS with custom design system
- **Deployment**: GitHub Pages via GitHub Actions

## 🚀 Getting Started

> **Note:** Ensure you have Node.js 18+ installed before running this command.

```bash
# Clone the repo
git clone https://github.com/saint2706/Coding-For-MBA.git
cd Coding-For-MBA

# Install dependencies
npm install

# Start dev server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── MarkdownRenderer.tsx
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── pages/             # Route-level page components
│   ├── Home.tsx
│   ├── Curriculum.tsx
│   ├── Lesson.tsx
│   └── PhaseOverview.tsx
├── styles/            # Modular CSS files
│   ├── index.css      # Barrel import
│   ├── variables.css  # Design tokens
│   ├── base.css       # Reset & layout
│   └── ...            # Per-component styles
├── utils/
│   └── contentLoader.ts  # Markdown parser & data layer
├── stores/            # Zustand state stores
├── App.tsx
└── main.tsx
content/lessons/       # 140 lesson markdown files
docs/                  # Documentation (Roadmap, Architecture)
scripts/               # Build and validation scripts
```

## 🔎 Lesson Search

- Use the **navbar search input** from any page, or open `/search` directly.
- Keyboard shortcuts:
  - `/` focuses the search box.
  - `Esc` clears the current query.
- Search indexes lesson `title`, `tags`, `concepts`, `phase`, `day`, and markdown body text.
- Code blocks are stripped before indexing so prose matches stay relevant.
- Ranking prioritizes **title > concepts > tags > body** and returns highlighted snippets.
- The index is built on the client and cached after initial load, so it works offline once assets are cached.

## 📜 Available Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build (includes sitemap, typecheck) |
| `npm run analyze` | Build + generate `dist/stats.html` bundle report |
| `npm run lint` | Run TypeScript compiler check (alias for `typecheck`) |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Verify formatting |
| `npm run validate-content` | Verify markdown content integrity |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Run unit tests with coverage report |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:e2e:headed` | Run Playwright end-to-end tests in headed mode |
| `npm run test:e2e:report` | Show Playwright test report |
| `npm run deploy` | Deploy to GitHub Pages |

## 📄 Documentation

For more details, please see:

- **[Contributing Guide](CONTRIBUTING.md)**: How to set up and contribute.
- **[Architecture](docs/ARCHITECTURE.md)**: Technical overview of the project.
- **[Roadmap](docs/todo.md)**: Upcoming features and improvements.

## 🤖 Dependabot Updates

- **Automatic schedule:** Dependabot checks both `npm` and `github-actions` every **Thursday at 1:00 PM IST** via `.github/dependabot.yml`.
- **Manual on-demand run:** GitHub does not currently provide a public API to trigger Dependabot version updates from a workflow. The `Dependabot On-Demand` workflow documents this limitation and points maintainers to supported alternatives.
- **Manual alternatives:** Use the GitHub UI **Insights → Dependency graph → Dependabot → Check for updates**, or rely on the weekly schedule in `.github/dependabot.yml`.

## 🧪 Visual Snapshot Testing

- Visual smoke tests live in `tests/e2e/visual-smoke.spec.ts` and capture snapshots for: home, curriculum, phase 1, lesson 1, progress, and search routes.
- Snapshots are generated from deterministic full-page screenshots and compared via committed SHA-256 text snapshots (no binary image baselines) with a fixed viewport and reduced-motion mode for stability.
- Update snapshots intentionally with:

```bash
npm run test:e2e -- --project=chromium tests/e2e/visual-smoke.spec.ts --update-snapshots
```

## 🧾 CI Artifacts (for maintainers)

GitHub Actions uploads machine-readable test and diagnostics artifacts to support debugging and historical comparisons:

- **CI workflow (`.github/workflows/ci.yml`)**
  - `unit-test-results`: Vitest JUnit XML at `test-results/vitest-junit.xml`.
  - `coverage-report`: coverage outputs from `coverage/` (including `lcov.info`, `cobertura-coverage.xml`, and HTML report files).
  - Retention: **14 days**.
- **Nightly Smoke workflow (`.github/workflows/nightly-smoke.yml`)**
  - On Playwright failures only: `nightly-playwright-html-report` from `playwright-report/`.
  - On Playwright failures only: `nightly-playwright-traces` from `test-results/` (trace bundles and related outputs).
  - Retention: **7 days**.
- **Lighthouse CI workflow (`.github/workflows/lighthouse.yml`)**
  - `lighthouse-report` from `.lighthouseci/`.
  - Retention: **7 days**.

You can download artifacts from the corresponding workflow run page in the **Actions** tab.

## ⚡ Build & Performance Notes

- **Bundle analysis**: run `npm run analyze` to generate a visual treemap report at `dist/stats.html` (powered by `rollup-plugin-visualizer`).
- **Route prefetching**: key nav links now prefetch lazy route chunks on hover/focus/touch so common transitions feel instant on warm networks.
- **Module preload tuning**: Vite preload dependencies are filtered/prioritized for JS/CSS runtime chunks to avoid noisy preload graphs.
- **Critical CSS plan**: we intentionally inline a small, maintainable CSS block in `index.html` for the home above-the-fold shell (`body`, `.page-container`, `.hero`), while leaving the main stylesheets untouched for long-term maintainability.

## 📄 License

This project is open source for educational purposes.

## 🔄 CI/CD Optimizations
- Pinned fake major tags for GitHub Actions to their true versions (`v4`, `v3`, `v7`, etc.)
- Fixed `dependency-review.yml` missing repository checkout step
