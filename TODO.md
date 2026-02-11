# TODO — Development Roadmap

> 6-month plan for evolving **Coding for MBA** from a static lesson viewer
> into a production-grade interactive learning platform.

---

## Month 1 — Foundation & Quality (Feb 2026)

### Week 1-2: Code Quality & DevOps

- [x] **Migrate to TypeScript** — rename `.jsx` → `.tsx`, add `tsconfig.json`
- [x] **Remove unused `gray-matter`** dep from `package.json`
- [x] **Replace root `README.md`** boilerplate with real project documentation
- [x] **Add CI/CD pipeline** — GitHub Actions workflow for lint → build → deploy on push to `main`
- [x] **Add `base` to `vite.config.js`** (`/Coding-For-MBA/`) for correct GH Pages asset paths
- [x] **Split `index.css`** (1200 lines) into modular CSS files per component/page
- [x] **Set up Prettier** — consistent formatting across project

### Week 3-4: SEO, Accessibility & Performance

- [x] **Add `<title>` and `<meta>` tags** per route using `react-helmet-async`
- [x] **Add `sitemap.xml` generator** for lesson/phase URLs
- [x] **Add `robots.txt`** and Open Graph meta tags for social sharing
- [x] **Add OG image generator** (dynamic preview images per lesson)
- [x] **Accessibility audit** — ARIA labels, keyboard nav, focus management, skip-to-content link
- [x] **Add `prefers-reduced-motion`** media query to disable animations
- [x] **Generate a custom favicon** (replace Vite default SVG)
- [x] **Lazy-load lesson content** — code-split heavy pages with `React.lazy` + `Suspense`
- [x] **Optimize bundle size** — chunk vendor libs (`react-syntax-highlighter` is 800KB+)

---

## Month 2 — Search & Navigation (Mar 2026)

### Full-Text Search

- [ ] **Build client-side search index** at build time (Fuse.js or Lunr.js)
- [ ] **Index lesson titles, tags, concepts, and body text**
- [ ] **Add search UI** — command palette (⌘K) with keyboard-navigable results
- [ ] **Add search results page** with highlighted matches

### Navigation Improvements

- [ ] **Add breadcrumb component** to all pages (not just lesson)
- [ ] **Add "Back to Top" floating button** on long lessons
- [ ] **Add Table of Contents** sidebar for each lesson (parse `h2`/`h3` headings)
- [ ] **Add keyboard shortcuts** — `←`/`→` for prev/next lesson, `/` for search
- [ ] **Active sidebar scroll-into-view** — auto-scroll sidebar to current lesson
- [ ] **Add 404 catch-all route** with helpful navigation links

---

## Month 3 — Progress Tracking & Interactivity (Apr 2026)

### Progress System

- [ ] **Add `localStorage` progress tracker** — mark lessons as complete
- [ ] **Progress bar per phase** (e.g., "4/12 lessons done")
- [ ] **Overall progress dashboard** — visual heatmap or streak calendar
- [ ] **Resume where you left off** — "Continue" button on homepage
- [ ] **Optional: add user auth** (GitHub OAuth) for cross-device sync

### Interactive Code

- [ ] **Embed Pyodide** (Python-in-browser) for "Try it yourself" blocks
- [ ] **Add interactive code playground** — editable + runnable Python snippets
- [ ] **Parse exercise blocks from markdown** and render as interactive widgets
- [ ] **Add "Check Answer" functionality** for mastery check questions

### Exercise & Solution System

- [ ] **Create `/exercises` route** — filterable exercise browser (by phase, difficulty, topic)
- [ ] **Render `Phase_XX_Solutions.ipynb`** — Jupyter notebook viewer (nbconvert or custom)
- [ ] **Add collapsible solution reveals** for in-lesson exercises

---

## Month 4 — Content Enrichment & UX Polish (May 2026)

### Content Features

- [ ] **Add estimated reading time** per lesson (word count ÷ 200 wpm)
- [ ] **Add "Prerequisites" pills** linking to required prior lessons
- [ ] **Add concept dependency graph** (Mermaid or D3.js visualization)
- [ ] **Add "Related Lessons"** section at bottom of each lesson
- [ ] **Add glossary/term definitions** — hover tooltips for technical terms

### UX & Design

- [ ] **Light mode toggle** — full theme switcher with `prefers-color-scheme` respect
- [ ] **Add loading skeletons** — placeholder shimmer for content areas
- [ ] **Print-friendly stylesheet** — clean PDF export for offline study
- [ ] **Improve mobile experience** — swipe gestures for prev/next, bottom nav bar
- [ ] **Add scroll progress indicator** — thin bar at top showing read percentage
- [ ] **Add smooth page transitions** using `framer-motion` or `View Transitions API`

### Content Management

- [ ] **Build content validation script** — check all 108 READMEs have required frontmatter fields
- [ ] **Add markdown lint to CI** — enforce consistent formatting
- [ ] **Generate content stats page** — total word count, lessons per difficulty, tag cloud

---

## Month 5 — Analytics, Social & Community (Jun 2026)

### Analytics & Feedback

- [ ] **Add Plausible/Umami analytics** (privacy-friendly, self-hostable)
- [ ] **Track popular lessons** and average time-on-page
- [ ] **Add feedback widget** per lesson ("Was this helpful?" + freeform input)
- [ ] **Add error boundary** components with user-friendly messaging

### Social & Sharing

- [ ] **Add "Share this lesson"** button (Twitter, LinkedIn, copy link)
- [ ] **Add lesson rating system** (stars or thumbs up/down, `localStorage`)
- [ ] **Generate pretty social cards** per lesson for link previews
- [ ] **Add comments/discussion** via GitHub Discussions or Giscus

### Curriculum Enhancements

- [ ] **Add skill tree visualization** — interactive DAG of topics/concepts
- [ ] **Add "Learning Path" recommendations** — guided sequences for specific roles
- [ ] **Phase completion certificates** — auto-generated SVG/PDF on 100% completion
- [ ] **Weekly study plan generator** — input available hours, get a personalized schedule

---

## Month 6 — Performance, Testing & Launch (Jul 2026)

### Testing

- [ ] **Add Vitest unit tests** for `contentLoader.js` (parser, data integrity)
- [ ] **Add Playwright E2E tests** — navigation, search, progress, rendering
- [ ] **Add visual regression tests** — screenshot comparisons for key pages
- [ ] **CI test gate** — block deploy if tests fail

### Performance

- [ ] **Audit Lighthouse scores** — target 95+ on all categories
- [ ] **Add service worker** for offline support (PWA)
- [ ] **Add resource hints** — `preconnect`, `prefetch` for Google Fonts
- [ ] **Optimize images** — WebP with `<picture>` fallbacks if user uploads diagrams
- [ ] **Consider SSG migration** — Astro or Next.js static export for better SEO/TTFB

### Launch Preparation

- [ ] **Custom domain setup** — `codingformba.com` or similar
- [ ] **Write proper `README.md`** with badges, screenshots, architecture diagram
- [ ] **Add `CONTRIBUTING.md`** — guide for content contributions
- [ ] **Add `LICENSE`** — MIT or CC BY for content
- [ ] **Create landing page** optimized for organic search
- [ ] **Submit to directories** — Product Hunt, Dev.to, Hacker News, r/learnpython

---

## Ongoing / Technical Debt

| Item                                                | Priority | Notes                                    |
| --------------------------------------------------- | -------- | ---------------------------------------- |
| Remove unused `gray-matter` from deps               | 🔴 High   | Adds ~150KB to install, never used       |
| Add `base` path to Vite config                      | 🔴 High   | Assets may 404 on GH Pages subpath       |
| Replace Vite default `README.md`                    | 🟡 Medium | Currently shows React+Vite template text |
| Responsive testing on real devices                  | 🟡 Medium | Only tested desktop viewport             |
| CSS custom properties audit                         | 🟢 Low    | Some vars may be unused                  |
| Content: verify all 108 lessons have code exercises | 🟡 Medium | Audit needed                             |
| Content: add diagrams/illustrations to lessons      | 🟢 Low    | SVGs or generated images                 |

---

## Architecture Decision Records

> Track key decisions as the project evolves.

| Decision                                | Status     | Date                                  |
| --------------------------------------- | ---------- | ------------------------------------- |
| HashRouter over BrowserRouter           | ✅ Decided  | Feb 2026 — required for GH Pages      |
| Custom YAML parser over gray-matter     | ✅ Decided  | Feb 2026 — browser compat             |
| Vanilla CSS over Tailwind               | ✅ Decided  | Feb 2026 — full control, no build dep |
| Client-side search over Algolia         | 📋 Proposed | — free, no external dep               |
| Pyodide over server-side code execution | 📋 Proposed | — runs entirely in browser            |
| TypeScript migration                    | 📋 Proposed | — type safety for growing codebase    |
