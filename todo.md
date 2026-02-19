# 📋 TODO — Coding for MBA

> Feature roadmap leveraging the upgraded stack.
> New deps: **motion**, **zustand**, **canvas-confetti**, **react-hot-toast**, **zod**.
> Major upgrades: **Vite 7**, **React 19.2.4**, **TypeScript 5.9**.

---

## 🔥 Quick Wins (1-2 hours each)

### Toast Notifications — `react-hot-toast`
- [ ] Add toast feedback on progress save ("Progress saved ✓")
- [ ] Toast on exercise submission (correct/incorrect)
- [ ] Toast on theme toggle ("Switched to dark mode")
- [ ] Toast on search palette open/close (keyboard shortcut hint)
- [ ] Error boundary toasts instead of blank error screens

### Confetti Celebrations — `canvas-confetti`
- [ ] Confetti burst when a quiz is aced (100%)
- [ ] Confetti on completing all exercises for a day
- [ ] Confetti on unlocking a new phase
- [ ] Subtle sparkle effect when marking a lesson complete
- [ ] End-of-curriculum celebration (full-screen fireworks)

### Content Validation — `zod`
- [ ] Define Zod schemas for lesson frontmatter
- [ ] Validate phase metadata at build time
- [ ] Schema-validate exercise JSON data
- [ ] Type-safe curriculum config with `z.infer<>`
- [ ] Add schema validation to the `validate-content` script

---

## ⚡ Animations & Motion — `motion`

### Page Transitions
- [ ] Fade + slide transitions between routes (AnimatePresence)
- [ ] Staggered card entrance on Curriculum page
- [ ] Smooth height transitions on accordion/collapsible sections
- [ ] Exit animations when navigating away from a page

### Micro-Interactions
- [ ] Sidebar items animate in on open
- [ ] Progress bar fills with spring physics
- [ ] Hover lift on lesson cards (scale + shadow)
- [ ] Button press scale-down feedback
- [ ] Code playground expand/collapse animation
- [ ] Tooltip fade-in with slight offset

### Scroll Animations
- [ ] Parallax hero section on Home page
- [ ] Lessons fade-in as they scroll into view
- [ ] Phase timeline animates on scroll
- [ ] Stats counters animate up when visible (intersection observer + motion)
- [ ] "Back to top" button slides in when scrolling down

### Layout Animations
- [ ] `layoutId` shared transitions for lesson → phase navigation
- [ ] Reorder animation for exercise list sorting
- [ ] Masonry-style stagger for concept graph nodes

---

## 🧠 State Management — `zustand`

### Progress Store
- [ ] Migrate localStorage progress reads/writes to a zustand store
- [ ] Persist middleware for automatic localStorage sync
- [ ] Computed selectors: `completedLessonsCount`, `phaseProgress`, `streakDays`
- [ ] Hydrate progress from localStorage on first mount (SSR-safe)

### Quiz State
- [ ] Track quiz attempts, scores, and timestamps
- [ ] Per-question analytics (most-missed questions)
- [ ] Quiz review mode: show correct answers after submission
- [ ] Spaced repetition: surface low-scoring quiz topics

### User Preferences Store
- [ ] Theme preference (already in context, consolidate)
- [ ] Sidebar default state (open/closed)
- [ ] Font size preference
- [ ] Code playground language preference (Python/SQL)
- [ ] Preferred lesson display density (compact/comfortable)

### Learning Analytics
- [ ] Time-on-page tracking per lesson
- [ ] Study streak counter with daily reset
- [ ] Weekly study summary chart
- [ ] Total learning time tracker

---

## 🎨 UI/UX Polish

### Visual Refinements
- [ ] Glassmorphism cards with backdrop-blur on dark mode
- [ ] Animated gradient mesh background for hero sections
- [ ] Custom cursor effects on interactive elements
- [ ] Sleek loading shimmer instead of skeleton pulses
- [ ] Animated SVG illustrations for empty states

### Navigation Enhancements
- [ ] Breadcrumb trail with animated chevrons
- [ ] "Continue where you left off" banner on Home page
- [ ] Keyboard shortcut overlay (press `?` to see all shortcuts)
- [ ] Swipe navigation between lessons on mobile
- [ ] Mini-map/scroll spy in sidebar for long lessons

### Gamification Layer
- [ ] XP points system (earn XP for completing lessons, exercises)
- [ ] Achievement badges (First Lesson, Speed Reader, Night Owl, etc.)
- [ ] Daily challenge: random exercise from any completed phase
- [ ] Leaderboard (local only, localStorage-persisted)
- [ ] Learning badges displayed on Progress page

---

## 🔧 Developer Experience

### Build & Performance
- [ ] Vite 7 module preload optimization for lazy routes
- [ ] Image optimization pipeline (WebP/AVIF generation)
- [ ] Bundle analysis script with visualized output
- [ ] Lighthouse CI in GitHub Actions
- [ ] Critical CSS extraction for above-the-fold rendering

### Testing
- [ ] Add Playwright visual regression tests for each page
- [ ] Test motion animations with `prefers-reduced-motion` mock
- [ ] Zustand store unit tests
- [ ] Zod schema validation tests
- [ ] Increase unit test coverage to 80%+

### Code Quality
- [ ] Strict TypeScript 5.9 `satisfies` patterns for config objects
- [ ] Error boundaries with toast fallbacks
- [ ] React 19 `use()` hook for promise-based data loading
- [ ] `useOptimistic` for instant progress updates

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

*Last updated: Feb 19, 2026*
