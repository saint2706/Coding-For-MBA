/**
 * Main Application Component
 *
 * Defines the core layout structure and routing configuration.
 *
 * Key Responsibilities:
 * - Manage global layout (Sidebar, Navbar, Main Content).
 * - Configure client-side routing (React Router).
 * - Handle page transitions (Framer Motion).
 * - Initialize global providers (Theme, etc.).
 */

import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import SkipToContent from './components/SkipToContent'
import ScrollProgress from './components/ScrollProgress'
import MobileNav from './components/MobileNav'
import KeyboardShortcutsOverlay from './components/KeyboardShortcutsOverlay'
import { PageSkeleton } from './components/Skeleton'
import { ThemeProvider } from './context/ThemeProvider'
import { hydrateProgressStore } from './utils/progressTracker'
import { hydrateQuizStore } from './stores/quizStore'
import { useUserPreferencesStore } from './stores/userPreferencesStore'
import { useLearningAnalytics } from './hooks/useLearningAnalytics'
import { hydrateGamificationStore } from './stores/gamificationStore'
import CustomCursor from './components/CustomCursor'

const Home = lazy(() => import('./pages/Home'))
const Lesson = lazy(() => import('./pages/Lesson'))
const PhaseOverview = lazy(() => import('./pages/PhaseOverview'))
const Curriculum = lazy(() => import('./pages/Curriculum'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const ProgressDashboard = lazy(() => import('./pages/ProgressDashboard'))
const Exercises = lazy(() => import('./pages/Exercises'))
const NotebookViewer = lazy(() => import('./pages/NotebookViewer'))
const ConceptGraphPage = lazy(() => import('./pages/ConceptGraphPage'))
const ContentStats = lazy(() => import('./pages/ContentStats'))
const Review = lazy(() => import('./pages/Review'))
const CaseStudies = lazy(() => import('./pages/CaseStudies'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  const sidebarDefaultOpen = useUserPreferencesStore((state) => state.sidebarDefaultOpen)
  const customCursorEnabled = useUserPreferencesStore((state) => state.customCursorEnabled)
  const [sidebarOpen, setSidebarOpen] = useState(sidebarDefaultOpen)
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()

  useLearningAnalytics(location.pathname)

  const isLesson = location.pathname.startsWith('/lesson/')

  useEffect(() => {
    hydrateProgressStore()
    hydrateQuizStore()
    hydrateGamificationStore()
  }, [])

  useEffect(() => {
    setSidebarOpen(sidebarDefaultOpen)
    window.scrollTo(0, 0)
  }, [location.pathname, sidebarDefaultOpen])

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', sidebarOpen)
    return () => {
      document.body.classList.remove('sidebar-open')
    }
  }, [sidebarOpen])

  return (
    <ThemeProvider>
      <div className="app-layout">
        <SkipToContent />
        <ScrollProgress isLesson={isLesson} targetSelector={isLesson ? 'article' : undefined} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="main-content" id="main-content" tabIndex={-1}>
          <Suspense fallback={<PageSkeleton />}>
            <LayoutGroup>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.24,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Routes location={location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/curriculum" element={<Curriculum />} />
                    <Route path="/phase/:phaseNum" element={<PhaseOverview />} />
                    <Route path="/lesson/:dayNum" element={<Lesson />} />
                    <Route path="/progress" element={<ProgressDashboard />} />
                    <Route path="/exercises" element={<Exercises />} />
                    <Route path="/solutions/:phaseNum" element={<NotebookViewer />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/concepts" element={<ConceptGraphPage />} />
                    <Route path="/stats" element={<ContentStats />} />
                    <Route path="/review" element={<Review />} />
                    <Route path="/case-studies" element={<CaseStudies />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </LayoutGroup>
          </Suspense>
        </main>
        <MobileNav />
        <KeyboardShortcutsOverlay />
        {customCursorEnabled && <CustomCursor />}
      </div>
    </ThemeProvider>
  )
}
