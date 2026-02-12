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

- [x] **Build client-side search index** at build time (Fuse.js or Lunr.js)
- [x] **Index lesson titles, tags, concepts, and body text**
- [x] **Add search UI** — command palette (⌘K) with keyboard-navigable results
- [x] **Add search results page** with highlighted matches

### Navigation Improvements

- [x] **Add breadcrumb component** to all pages (not just lesson)
- [x] **Add "Back to Top" floating button** on long lessons
- [x] **Add Table of Contents** sidebar for each lesson (parse `h2`/`h3` headings)
- [x] **Add keyboard shortcuts** — `←`/`→` for prev/next lesson, `/` for search
- [x] **Active sidebar scroll-into-view** — auto-scroll sidebar to current lesson
- [x] **Add 404 catch-all route** with helpful navigation links

---

## Month 3 — Progress Tracking & Interactivity (Apr 2026)

### Progress System

- [x] **Add `localStorage` progress tracker** — mark lessons as complete
- [x] **Progress bar per phase** (e.g., "4/12 lessons done")
- [x] **Overall progress dashboard** — visual heatmap or streak calendar
- [x] **Resume where you left off** — "Continue" button on homepage
- [ ] **Optional: add user auth** (GitHub OAuth) for cross-device sync

### Interactive Code

- [x] **Embed Pyodide** (Python-in-browser) for "Try it yourself" blocks
- [x] **Add interactive code playground** — editable + runnable Python snippets
- [x] **Parse exercise blocks from markdown** and render as interactive widgets
- [x] **Add "Check Answer" functionality** for mastery check questions

### Exercise & Solution System

- [x] **Create `/exercises` route** — filterable exercise browser (by phase, difficulty, topic)
- [x] **Render `Phase_XX_Solutions.ipynb`** — Jupyter notebook viewer (nbconvert or custom)
- [x] **Add collapsible solution reveals** for in-lesson exercises

---

## Month 4 — Content Enrichment & UX Polish (May 2026)

### Content Features

- [x] **Add estimated reading time** per lesson (word count ÷ 200 wpm)
- [x] **Add "Prerequisites" pills** linking to required prior lessons
- [x] **Add concept dependency graph** (Mermaid or D3.js visualization)
- [x] **Add "Related Lessons"** section at bottom of each lesson
- [x] **Add glossary/term definitions** — hover tooltips for technical terms

### UX & Design

- [x] **Light mode toggle** — full theme switcher with `prefers-color-scheme` respect
- [x] **Add loading skeletons** — placeholder shimmer for content areas
- [x] **Print-friendly stylesheet** — clean PDF export for offline study
- [x] **Improve mobile experience** — swipe gestures for prev/next, bottom nav bar
- [x] **Add scroll progress indicator** — thin bar at top showing read percentage
- [x] **Add smooth page transitions** using `framer-motion` or `View Transitions API`

### Content Management

- [x] **Build content validation script** — check all 108 READMEs have required frontmatter fields
- [x] **Add markdown lint to CI** — enforce consistent formatting
- [x] **Generate content stats page** — total word count, lessons per difficulty, tag cloud

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

## Code Quality & Testing (PRIORITY)

> **Status**: 0% test coverage — critical gap before production launch

### Unit Testing

- [ ] **Set up Vitest** — add `vitest.config.ts` and test runner script
- [ ] **Test contentLoader.ts** (511 lines)
  - [ ] YAML frontmatter parser (edge cases: multiline, special chars)
  - [ ] Lesson data enrichment (reading time, prerequisites)
  - [ ] Error handling for malformed content
  - [ ] Data integrity validation
- [ ] **Test progressTracker.ts** (151 lines)
  - [ ] localStorage read/write operations
  - [ ] Progress calculation logic
  - [ ] Quota overflow handling
  - [ ] Private browsing mode fallback
- [ ] **Test searchIndex.ts** (120 lines)
  - [ ] Fuse.js index building
  - [ ] Search ranking algorithm
  - [ ] Debounce behavior
- [ ] **Test glossary.ts** (96 lines)
  - [ ] Term extraction from markdown
  - [ ] Tooltip positioning logic
- [ ] **Target 70%+ code coverage** — enforce in CI pipeline

### End-to-End Testing

- [ ] **Set up Playwright** — install `@playwright/test` and config
- [ ] **Test critical user flows**
  - [ ] Navigation: home → curriculum → lesson → phase
  - [ ] Search: open palette (⌘K) → type query → navigate to result
  - [ ] Progress tracking: mark lesson complete → verify persistence
  - [ ] Code execution: write Python → run → verify output
  - [ ] Theme toggle: switch light/dark → verify persistence
  - [ ] Mobile navigation: swipe gestures, bottom nav
- [ ] **Visual regression tests** — screenshot key pages for UI consistency
- [ ] **CI gate** — fail deployment if tests don't pass

### Code Quality Checks

- [ ] **Enable TypeScript strict mode** — add `"strict": true` to `tsconfig.json`
- [ ] **Eliminate `any` types** — found in 4 files (ConceptGraph, NotebookViewer, glossary, contentLoader)
- [ ] **Replace non-null assertions (`!`)** — use type guards instead
- [ ] **Add JSDoc comments** — document all exported functions in utils
- [ ] **Run Sonarqube/CodeClimate** — static analysis for bugs and smells
- [ ] **Add pre-commit hooks** — Husky + lint-staged for format/lint checks

---

## Security Hardening

> **Status**: 1 critical XSS vulnerability identified

### Critical

- [ ] **Add DOMPurify sanitization** for markdown HTML output
  - [ ] Install `dompurify` and `@types/dompurify`
  - [ ] Sanitize `rehype-raw` output in MarkdownRenderer
  - [ ] Test against XSS payloads (`<script>`, `<iframe>`, `javascript:`)
- [ ] **Add Content Security Policy headers** for GitHub Pages
  - [ ] Create `_headers` file for Surge deployment
  - [ ] Restrict script sources to `'self'` and CDNs
  - [ ] Block inline scripts except Pyodide loader

### High Priority

- [ ] **Add dependency security checks** to CI
  - [ ] Run `npm audit` on every PR
  - [ ] Block merges if critical vulnerabilities found
  - [ ] Set up Dependabot for auto-updates
- [ ] **Validate localStorage data integrity**
  - [ ] Add JSON schema validation for progress data
  - [ ] Sanitize data before saving (size limits, type checks)
  - [ ] Handle quota overflow gracefully
- [ ] **Add YAML parser security tests**
  - [ ] Verify protection against prototype pollution
  - [ ] Test malicious frontmatter payloads
  - [ ] Already has `__proto__` checks — add regression tests

### Medium Priority

- [ ] **Add rate limiting for Pyodide execution** (prevent infinite loops)
- [ ] **Add CORS headers audit** for API endpoints (if any future backend)
- [ ] **Document security assumptions** in SECURITY.md
- [ ] **Add security.txt** file (vulnerability disclosure process)

---

## Performance Optimization

> **Goal**: Lighthouse score 95+ across all categories

### Bundle Size

- [ ] **Audit current bundle size** — run `npm run build` and analyze chunks
- [ ] **Lazy-load Pyodide** (5MB CDN) — only fetch on first code execution
  - [ ] Show loading indicator with estimated wait time
  - [ ] Cache Pyodide instance across sessions
  - [ ] Add "preload on idle" option in settings
- [ ] **Optimize react-syntax-highlighter** — already chunked, consider PrismJS lite
- [ ] **Tree-shake D3.js** — only import used modules (not full bundle)
- [ ] **Add bundle analyzer** — visualize dependency sizes (`rollup-plugin-visualizer`)

### Runtime Performance

- [ ] **Memoize expensive calculations**
  - [ ] Concept graph D3.js layout (use `useMemo`)
  - [ ] Search index (already cached, verify)
  - [ ] Reading time calculation
- [ ] **Add `useCallback` for event handlers** — prevent unnecessary re-renders
- [ ] **Virtualize long lists** — exercise browser, search results (react-window)
- [ ] **Optimize images** — add WebP support with `<picture>` fallbacks
- [ ] **Add resource hints**
  - [ ] `<link rel="preconnect">` for cdn.jsdelivr.net (Pyodide)
  - [ ] `<link rel="dns-prefetch">` for Google Fonts
  - [ ] `<link rel="prefetch">` for next lesson in sequence

### Monitoring

- [ ] **Set up Lighthouse CI** — run on every PR, track scores over time
- [ ] **Add Core Web Vitals tracking** — measure LCP, CLS, FID
- [ ] **Create performance budget** — fail build if bundle exceeds 1MB
- [ ] **Profile React DevTools** — identify slow components

---

## Developer Experience (DevX)

> **Goal**: Make it easy for contributors to add content and features

### Documentation

- [ ] **Create CONTRIBUTING.md**
  - [ ] Local setup instructions (Node version, npm install)
  - [ ] How to add a new lesson (frontmatter template, markdown guide)
  - [ ] Code style guide (ESLint + Prettier rules)
  - [ ] PR review process and checklist
  - [ ] How to run tests locally
- [ ] **Create ARCHITECTURE.md**
  - [ ] Data flow diagram (content → loader → React)
  - [ ] Component hierarchy and state management
  - [ ] Routing structure and page lazy-loading
  - [ ] Decision records (why HashRouter, why no gray-matter, etc.)
- [ ] **Add inline code documentation**
  - [ ] JSDoc for all exported functions
  - [ ] Type definitions for lesson frontmatter schema
  - [ ] Comment complex regex patterns
- [ ] **Create SECURITY.md** — vulnerability disclosure policy
- [ ] **Add LICENSE** file — MIT or CC BY for content

### Tooling

- [ ] **Add Storybook** — component library for UI development
- [ ] **Add dev mode content hot-reload** — watch Lessons folder
- [ ] **Add lesson frontmatter validator** (Zod or io-ts schema)
- [ ] **Create lesson template generator** — `npm run new-lesson`
- [ ] **Add VS Code workspace settings** — recommended extensions, debug config
- [ ] **Add GitHub issue templates** — bug report, feature request, lesson content

### CI/CD Improvements

- [ ] **Add preview deployments** — Vercel/Netlify for PR previews
- [ ] **Add deploy notifications** — Slack/Discord webhook on deploy success/fail
- [ ] **Add deployment smoke tests** — verify site loads after deploy
- [ ] **Add branch protection rules** — require passing tests before merge
- [ ] **Add semantic versioning** — auto-generate CHANGELOG.md

---

## Content Management

> **Status**: 108 lessons, needs better organization and quality control

### Content Quality

- [ ] **Validate all 108 lessons have required frontmatter**
  - [ ] title, difficulty, duration, tags, description
  - [ ] Run validation script in CI (already exists, expand checks)
- [ ] **Audit lesson exercises** — ensure all have "Try it yourself" sections
- [ ] **Add solution explanations** — not just code, explain _why_
- [ ] **Add diagrams and visualizations**
  - [ ] Data structure diagrams (lists, dicts, trees)
  - [ ] Algorithm flowcharts (sorting, searching)
  - [ ] ML concept illustrations (neural networks, decision trees)
- [ ] **Add video embeds** — supplementary YouTube explanations (optional)
- [ ] **Add external resource links** — official docs, Stack Overflow threads

### Content Features

- [ ] **Add code snippet library** — reusable examples per topic
- [ ] **Add cheat sheet generator** — printable reference cards per phase
- [ ] **Add spaced repetition system** — Anki-style flashcards for key concepts
- [ ] **Add lesson version history** — track content updates over time
- [ ] **Add lesson difficulty progression** — gradually increase complexity
- [ ] **Add "Quick Reference" mode** — TL;DR summary view for lessons

### Content Tooling

- [ ] **Add markdown linting** to CI (already in place, expand rules)
- [ ] **Add spell checker** — hunspell or cspell integration
- [ ] **Add broken link checker** — validate external URLs in lessons
- [ ] **Add content stats dashboard** — word count, difficulty distribution
- [ ] **Add AI-powered content suggestions** — GPT-4 for exercise ideas

---

## Error Handling & Resilience

> **Status**: Limited error boundaries, no user-facing error messages

### Error Boundaries

- [ ] **Add root-level error boundary** — catch all unhandled React errors
- [ ] **Wrap each page route** in error boundary (Home, Lesson, etc.)
- [ ] **Create user-friendly error UI** — "Oops, something went wrong"
- [ ] **Add "Report Bug" button** in error fallback (GitHub issue template)
- [ ] **Log errors to console** for debugging (production-safe)

### Network & Data Errors

- [ ] **Handle Pyodide load failures** — CDN timeout, network errors
  - [ ] Show retry button with exponential backoff
  - [ ] Fallback to read-only mode if Pyodide unavailable
- [ ] **Handle localStorage failures** — private browsing, quota exceeded
  - [ ] Show warning to user
  - [ ] Offer data export before clearing
- [ ] **Handle malformed lesson content** — YAML parse errors
  - [ ] Show error page instead of crashing
  - [ ] Link to GitHub issue for content fix

### User Feedback

- [ ] **Add global toast notification system** — success/error messages
- [ ] **Add loading states for async operations** — code execution, search
- [ ] **Add timeout handling** — kill long-running Pyodide code (10s limit)
- [ ] **Add offline indicator** — show banner when network unavailable

---

## Deployment & Infrastructure

> **Goal**: Production-ready hosting with custom domain

### Hosting

- [ ] **Custom domain setup** — `codingformba.com` (register + DNS config)
- [ ] **Add HTTPS enforcement** — ensure all requests redirect to https://
- [ ] **Add CDN configuration** — CloudFlare or Fastly for global edge caching
- [ ] **Add uptime monitoring** — Pingdom, UptimeRobot (99.9% SLA goal)

### Multi-Environment Setup

- [ ] **Staging environment** — preview.codingformba.com
- [ ] **Production environment** — codingformba.com
- [ ] **Local development env variables** — `.env.local` for config
- [ ] **Environment-specific analytics** — don't track dev/staging traffic

### Backup & Disaster Recovery

- [ ] **Add database backup** (if user auth added) — daily snapshots
- [ ] **Add content version control** — Git already tracks, document restore process
- [ ] **Add rollback procedure** — revert to previous deploy if issues
- [ ] **Document disaster recovery** — RTO/RPO targets

---

## Monitoring & Observability

> **Goal**: Understand how users interact with the platform

### Analytics

- [ ] **Add privacy-friendly analytics** (Plausible, Umami, or GoatCounter)
  - [ ] Track page views per lesson
  - [ ] Track search queries (aggregate, not individual users)
  - [ ] Track code execution attempts
  - [ ] Track progress milestones (phase completion)
- [ ] **Add conversion funnels** — lesson start → lesson complete
- [ ] **Add A/B testing framework** — test UI variations (optional)
- [ ] **Create analytics dashboard** — weekly reports for content creators

### User Feedback

- [ ] **Add "Was this helpful?" widget** per lesson
  - [ ] Thumbs up/down with optional freeform text
  - [ ] Store in localStorage or send to backend
- [ ] **Add lesson rating system** (1-5 stars)
- [ ] **Add bug report button** — pre-fill GitHub issue with context
- [ ] **Add feature request form** — structured input for ideas

### Performance Monitoring

- [ ] **Add error tracking** (Sentry or Rollbar) — capture React errors
- [ ] **Add performance monitoring** (Web Vitals API)
- [ ] **Add custom metrics** — code execution latency, search response time
- [ ] **Set up alerts** — Slack/email notification for critical errors

---

## Accessibility Enhancements

> **Goal**: WCAG 2.1 AA compliance

### Current Gaps

- [ ] **Add focus trap in SearchPalette modal** — prevent tab escape
- [ ] **Audit color contrast ratios** — ensure 4.5:1 minimum (Lighthouse)
- [ ] **Validate heading hierarchy** — H1→H2→H3, no skips
- [ ] **Add keyboard shortcuts help modal** (⌘/Ctrl + ?)
  - [ ] List all shortcuts: ⌘K (search), / (focus search), ←→ (nav)
- [ ] **Add skip links** — "Skip to exercises", "Skip to solutions"
- [ ] **Add ARIA live regions** — announce dynamic content changes
- [ ] **Test with screen readers** — NVDA, JAWS, VoiceOver

### Advanced Features

- [ ] **Add text-to-speech** for lessons (Web Speech API)
- [ ] **Add dyslexia-friendly font option** (OpenDyslexic)
- [ ] **Add high-contrast theme** for visually impaired users
- [ ] **Add captions for code explanations** (if video added)

---

## Mobile Experience

> **Status**: Responsive, but UX could be improved

### Optimizations

- [ ] **Add bottom navigation bar** — already exists, expand features
- [ ] **Add swipe gestures** — already exists, add haptic feedback
- [ ] **Add pull-to-refresh** for lesson list
- [ ] **Optimize touch target sizes** — 44x44px minimum (iOS guidelines)
- [ ] **Add iOS/Android app manifest** — installable PWA
- [ ] **Add splash screen** for PWA install
- [ ] **Test on real devices** — iOS Safari, Android Chrome (multiple screen sizes)

### Mobile-Specific Features

- [ ] **Add offline reading mode** — cache lessons for no-network access
- [ ] **Add reading progress sync** across devices (requires auth)
- [ ] **Add mobile code keyboard** — dedicated keys for `()`, `[]`, `:`
- [ ] **Add voice input** for code (experimental, Speech Recognition API)

---

## Advanced Features (Future)

> **Ideas for post-launch enhancements**

### Personalization

- [ ] **User profiles** (optional GitHub OAuth)
  - [ ] Cross-device progress sync
  - [ ] Public profile page with completed lessons
  - [ ] Streak tracking and badges
- [ ] **Adaptive difficulty** — adjust recommendations based on performance
- [ ] **Learning path customization** — choose career focus (Data Analyst, ML Engineer)
- [ ] **Recommended next lesson** — AI-powered suggestions

### Gamification

- [ ] **Achievement system** — unlock badges for milestones
- [ ] **Leaderboard** (optional, public) — top learners by progress
- [ ] **Daily challenges** — coding problems to maintain streak
- [ ] **Phase completion certificates** — auto-generated PDF/SVG

### Community

- [ ] **Discussion threads per lesson** (GitHub Discussions or Giscus)
- [ ] **User-submitted solutions** — showcase different approaches
- [ ] **Mentor marketplace** — connect learners with tutors
- [ ] **Study groups** — find peers at same phase

### Content Delivery

- [ ] **Email course** — drip lessons daily via email (optional)
- [ ] **Mobile app** (React Native wrapper)
- [ ] **API for external integrations** — embed lessons in other platforms
- [ ] **Content partnerships** — collaborate with bootcamps/universities

---

## Experimental / Research Ideas

> **Unvalidated concepts to explore**

- [ ] **AI coding assistant** — GPT-4 integration for hints (expensive, consider limits)
- [ ] **Live coding sessions** — WebRTC for peer programming
- [ ] **Jupyter notebook export** — download lessons as `.ipynb`
- [ ] **Interactive quizzes** with immediate feedback (beyond mastery checks)
- [ ] **Code execution history** — save all previous runs per lesson
- [ ] **Collaborative learning** — shared code editor (like Google Docs)
- [ ] **Voice-activated navigation** (accessibility + hands-free)
- [ ] **VR/AR learning environment** (far future, experimental)

---

## Architecture Decision Records

> Track key decisions as the project evolves.

| Decision                                | Status     | Date                                      |
| --------------------------------------- | ---------- | ----------------------------------------- |
| HashRouter over BrowserRouter           | ✅ Decided  | Feb 2026 — required for GH Pages          |
| Custom YAML parser over gray-matter     | ✅ Decided  | Feb 2026 — browser compat                 |
| Vanilla CSS over Tailwind               | ✅ Decided  | Feb 2026 — full control, no build dep     |
| Client-side search over Algolia         | ✅ Decided  | Feb 2026 — Fuse.js, free, no external dep |
| Pyodide over server-side code execution | ✅ Decided  | Feb 2026 — runs entirely in browser       |
| TypeScript migration                    | ✅ Decided  | Feb 2026 — type safety for growing codebase|
| DOMPurify for XSS protection            | 📋 Proposed | — sanitize markdown HTML output           |
| Vitest over Jest                        | 📋 Proposed | — native Vite integration, faster         |
| Playwright over Cypress                 | 📋 Proposed | — better TypeScript support, multi-browser|

---

## Key Metrics & Goals

> Track progress toward production readiness

### Current State (Feb 2026)

| Metric                  | Current | Target    | Priority |
| ----------------------- | ------- | --------- | -------- |
| Test Coverage           | 0%      | 70%+      | 🔴 Critical |
| TypeScript Strict Mode  | ❌       | ✅         | 🔴 Critical |
| Security Vulnerabilities| 1 XSS   | 0         | 🔴 Critical |
| Lighthouse Score        | Unknown | 95+       | 🟡 High    |
| Bundle Size             | ~1.2MB  | <1MB      | 🟡 High    |
| E2E Test Coverage       | 0%      | 80%+      | 🟡 High    |
| WCAG Compliance         | Partial | AA        | 🟡 High    |
| Documentation Coverage  | 30%     | 100%      | 🟢 Medium  |
| Error Boundaries        | 0       | All pages | 🔴 Critical |
| Content Validation      | Basic   | Schema    | 🟢 Medium  |

### Q1 2026 Goals (Pre-Launch)

- ✅ Migrate to TypeScript
- ✅ Set up CI/CD pipeline
- ✅ Implement core features (search, progress, interactive code)
- 🎯 **Add test suite (Vitest + Playwright)**
- 🎯 **Fix XSS vulnerability (DOMPurify)**
- 🎯 **Add error boundaries**
- 🎯 **Enable TypeScript strict mode**

### Q2 2026 Goals (Launch)

- 🎯 Custom domain setup
- 🎯 Analytics integration
- 🎯 User feedback system
- 🎯 Performance optimization (Lighthouse 95+)
- 🎯 WCAG AA compliance
- 🎯 Community features (comments, ratings)

### Long-Term Vision (2026-2027)

- 🔮 User authentication & cross-device sync
- 🔮 Gamification (badges, certificates, leaderboard)
- 🔮 Mobile app (PWA → React Native)
- 🔮 AI-powered learning assistant
- 🔮 Community-driven content contributions

---

## Prioritization Framework

> How to decide what to work on next

### Must-Have (Blocking Launch)

1. **Security**: Fix XSS vulnerability
2. **Testing**: 70% code coverage minimum
3. **Error Handling**: Error boundaries on all pages
4. **TypeScript**: Enable strict mode, eliminate `any`
5. **Performance**: Lighthouse 95+ score
6. **Accessibility**: WCAG AA compliance

### Should-Have (Launch Week)

1. **Analytics**: User tracking (privacy-friendly)
2. **Feedback**: Lesson ratings and comments
3. **Documentation**: CONTRIBUTING.md, ARCHITECTURE.md
4. **Monitoring**: Error tracking (Sentry)
5. **Custom Domain**: Production URL setup

### Nice-to-Have (Post-Launch)

1. **User Auth**: GitHub OAuth for sync
2. **Gamification**: Badges and certificates
3. **Community**: Discussion forums
4. **Mobile**: Enhanced PWA experience
5. **AI Features**: Coding assistant

### Future Research

1. Live coding sessions (WebRTC)
2. VR/AR learning environments
3. Voice-activated navigation
4. Collaborative code editing

---

## Contributing to This Roadmap

> Help us prioritize and refine this plan

1. **Vote on priorities** — comment on GitHub issues with 👍/👎
2. **Suggest new features** — open a discussion in GitHub Discussions
3. **Claim a task** — assign yourself to an issue
4. **Report bugs** — use issue templates
5. **Review PRs** — help maintain quality

**Last Updated**: February 12, 2026  
**Maintained by**: @saint2706  
**Status**: Active Development 🚧
