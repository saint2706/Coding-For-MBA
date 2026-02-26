# 📋 TODO — Coding for MBA

> Feature roadmap leveraging the upgraded stack.
> New deps: **motion**, **zustand**, **canvas-confetti**, **react-hot-toast**, **zod**.
> Major upgrades: **Vite 7**, **React 19.2.4**, **TypeScript 5.9**.

---

## 🔥 Quick Wins (1-2 hours each)

### Toast Notifications — `react-hot-toast`

- [x] Add toast feedback on progress save ("Progress saved ✓")
- [x] Toast on exercise submission (correct/incorrect)
- [x] Toast on theme toggle ("Switched to dark mode")
- [x] Toast on search palette open/close (keyboard shortcut hint)
- [x] Error boundary toasts instead of blank error screens

### Confetti Celebrations — `canvas-confetti`

- [x] Confetti burst when a quiz is aced (100%)
- [x] Confetti on completing all exercises for a day
- [x] Confetti on unlocking a new phase
- [x] Subtle sparkle effect when marking a lesson complete
- [x] End-of-curriculum celebration (full-screen fireworks)

### Content Validation — `zod`

- [x] Define Zod schemas for lesson frontmatter
- [x] Validate phase metadata at build time
- [x] Schema-validate exercise JSON data
- [x] Type-safe curriculum config with `z.infer<>`
- [x] Add schema validation to the `validate-content` script

---

## ⚡ Animations & Motion — `motion`

### Page Transitions

- [x] Fade + slide transitions between routes (AnimatePresence)
- [x] Staggered card entrance on Curriculum page
- [x] Smooth height transitions on accordion/collapsible sections
- [x] Exit animations when navigating away from a page

### Micro-Interactions

- [x] Sidebar items animate in on open
- [x] Progress bar fills with spring physics
- [x] Hover lift on lesson cards (scale + shadow)
- [x] Button press scale-down feedback
- [x] Code playground expand/collapse animation
- [x] Tooltip fade-in with slight offset

### Scroll Animations

- [x] Parallax hero section on Home page
- [x] Lessons fade-in as they scroll into view
- [x] Phase timeline animates on scroll
- [x] Stats counters animate up when visible (intersection observer + motion)
- [x] "Back to top" button slides in when scrolling down

### Layout Animations

- [x] `layoutId` shared transitions for lesson → phase navigation
- [x] Reorder animation for exercise list sorting
- [x] Masonry-style stagger for concept graph nodes

---

## 🧠 State Management — `zustand`

### Progress Store

- [x] Migrate localStorage progress reads/writes to a zustand store
- [x] Persist middleware for automatic localStorage sync
- [x] Computed selectors: `completedLessonsCount`, `phaseProgress`, `streakDays`
- [x] Hydrate progress from localStorage on first mount (SSR-safe)

### Quiz State

- [x] Track quiz attempts, scores, and timestamps
- [x] Per-question analytics (most-missed questions)
- [x] Quiz review mode: show correct answers after submission
- [x] Spaced repetition: surface low-scoring quiz topics

### User Preferences Store

- [x] Theme preference (already in context, consolidate)
- [x] Sidebar default state (open/closed)
- [x] Font size preference
- [x] Code playground language preference (Python/SQL)
- [x] Preferred lesson display density (compact/comfortable)

### Learning Analytics

- [x] Time-on-page tracking per lesson
- [x] Study streak counter with daily reset
- [x] Weekly study summary chart
- [x] Total learning time tracker

---

## 🎨 UI/UX Polish

### Visual Refinements

- [x] Glassmorphism cards with backdrop-blur on dark mode
- [x] Animated gradient mesh background for hero sections
- [x] Custom cursor effects on interactive elements
- [x] Sleek loading shimmer instead of skeleton pulses
- [x] Animated SVG illustrations for empty states

### Navigation Enhancements

- [x] Breadcrumb trail with animated chevrons
- [x] "Continue where you left off" banner on Home page
- [x] Keyboard shortcut overlay (press `?` to see all shortcuts)
- [x] Swipe navigation between lessons on mobile
- [x] Mini-map/scroll spy in sidebar for long lessons

### Gamification Layer

- [x] XP points system (earn XP for completing lessons, exercises)
- [x] Achievement badges (First Lesson, Speed Reader, Night Owl, etc.)
- [x] Daily challenge: random exercise from any completed phase
- [x] Leaderboard (local only, localStorage-persisted)
- [x] Learning badges displayed on Progress page

---

## 🔧 Developer Experience

### Build & Performance

- [x] Vite 7 module preload optimization for lazy routes
- [x] Image optimization pipeline (WebP/AVIF generation)
- [x] Bundle analysis script with visualized output
- [x] Lighthouse CI in GitHub Actions
- [x] Critical CSS extraction for above-the-fold rendering

### Testing

- [x] Add Playwright visual regression tests for each page
- [x] Test motion animations with `prefers-reduced-motion` mock
- [x] Zustand store unit tests
- [x] Zod schema validation tests
- [ ] Increase unit test coverage to 80%+

### Code Quality

- [x] Strict TypeScript 5.9 `satisfies` patterns for config objects
- [x] Error boundaries with toast fallbacks
- [x] React 19 `use()` hook — N/A (data loading is synchronous, no async fetching)
- [x] `useOptimistic` — N/A (progress updates are sync localStorage writes)

---

## 🚀 Ambitious Ideas (Multi-day effort)

### AI-Powered Study Assistant

- [ ] Integrate an LLM API for "Ask about this lesson" feature
- [ ] Auto-generate flashcards from lesson content
- [ ] Smart exercise hint system (progressive hints)

### Collaborative Features

- [ ] Shareable progress link (base64-encoded state)
- [ ] "Challenge a friend" — send quiz links
- [ ] Discussion prompts at the end of each lesson

### Offline Support

- [ ] Service Worker for offline lesson reading
- [ ] Cache lesson markdown on first visit
- [ ] Offline progress tracking with sync-on-reconnect
- [ ] PWA manifest for "Add to Home Screen"

### Advanced Visualizations

- [ ] 3D concept graph using Three.js / React Three Fiber
- [ ] Animated dependency tree of tech concepts
- [ ] Skill radar chart on Progress page
- [ ] Heatmap calendar of study activity (GitHub-style)

---

*Last updated: Feb 26, 2026*
