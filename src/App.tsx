/**
 * Main Application Component
 *
 * Defines the core layout structure and routing configuration.
 *
 * Key Responsibilities:
 * - Manage global layout (Sidebar, Navbar, Main Content).
 * - Configure client-side routing (React Router).
 * - Initialize global providers (Theme, etc.).
 */

import { useState, useEffect, useLayoutEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import SkipToContent from './components/SkipToContent'
import ScrollProgress from './components/ScrollProgress'
import { PageSkeleton, LessonSkeleton } from './components/Skeleton'
import { ThemeProvider } from './context/ThemeProvider'
import { hydrateProgressStore } from './utils/progressTracker'
import { hydrateQuizStore } from './stores/quizStore'
import { useUserPreferencesStore } from './stores/userPreferencesStore'
import { useLearningAnalytics } from './hooks/useLearningAnalytics'
import { hydrateGamificationStore } from './stores/gamificationStore'
import { hydrateMasteryStore } from './stores/masteryStore'
import { preloadSearchIndex } from './utils/searchIndex'

const Home = lazy(() => import('./pages/Home'))
const Lesson = lazy(() => import('./pages/Lesson'))
const PhaseOverview = lazy(() => import('./pages/PhaseOverview'))
const Curriculum = lazy(() => import('./pages/Curriculum'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const ProgressDashboard = lazy(() => import('./pages/ProgressDashboard'))
const Exercises = lazy(() => import('./pages/Exercises'))
const NotebookViewer = lazy(() => import('./pages/NotebookViewer'))
const NotesPage = lazy(() => import('./pages/NotesPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ContentStats = lazy(() => import('./pages/ContentStats'))
const Review = lazy(() => import('./pages/Review'))
const CaseStudies = lazy(() => import('./pages/CaseStudies'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Sidebar = lazy(() => import('./components/Sidebar'))
const MobileNav = lazy(() => import('./components/MobileNav'))
const KeyboardShortcutsOverlay = lazy(() => import('./components/KeyboardShortcutsOverlay'))
const CustomCursor = lazy(() => import('./components/CustomCursor'))
const SearchPalette = lazy(() => import('./components/SearchPalette'))

/**
 * Main application component that sets up routing, layout, and global context providers.
 *
 * @returns The main application element tree.
 */
export default function App() {
  const sidebarDefaultOpen = useUserPreferencesStore((state) => state.sidebarDefaultOpen)
  const customCursorEnabled = useUserPreferencesStore((state) => state.customCursorEnabled)
  const [sidebarOpen, setSidebarOpen] = useState(sidebarDefaultOpen)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [shortcutsOverlayOpen, setShortcutsOverlayOpen] = useState(false)
  const location = useLocation()

  useLearningAnalytics(location.pathname)

  const isLesson = location.pathname.startsWith('/lesson/')

  useLayoutEffect(() => {
    hydrateProgressStore()
    hydrateQuizStore()
    hydrateGamificationStore()
    hydrateMasteryStore()
  }, [])

  useEffect(() => {
    // ⚡ Bolt: Preload search index in background to eliminate input delay when user starts a search
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => preloadSearchIndex(), { timeout: 2000 })
    } else {
      setTimeout(() => preloadSearchIndex(), 500)
    }
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

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if (isCmdK) {
        event.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <ThemeProvider>
      <div className="app-layout">
        <SkipToContent />
        <ScrollProgress isLesson={isLesson} targetSelector={isLesson ? 'article' : undefined} />
        <Suspense fallback={null}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </Suspense>
        <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="main-content" id="main-content" tabIndex={-1}>
          <Suspense fallback={isLesson ? <LessonSkeleton /> : <PageSkeleton />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/curriculum" element={<Curriculum />} />
              <Route path="/phase/:phaseNum" element={<PhaseOverview />} />
              <Route path="/lesson/:dayNum" element={<Lesson />} />
              <Route path="/progress" element={<ProgressDashboard />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/solutions/:phaseNum" element={<NotebookViewer />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/stats" element={<ContentStats />} />
              <Route path="/review" element={<Review />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <MobileNav />
          <KeyboardShortcutsOverlay
            isOpen={shortcutsOverlayOpen}
            onOpen={() => setShortcutsOverlayOpen(true)}
            onClose={() => setShortcutsOverlayOpen(false)}
          />
          {customCursorEnabled && <CustomCursor />}
          <SearchPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            onOpenShortcuts={() => setShortcutsOverlayOpen(true)}
          />
        </Suspense>
      </div>
    </ThemeProvider>
  )
}
