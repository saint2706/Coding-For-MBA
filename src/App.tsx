/**
 * Main Application Component
 *
 * Root component that sets up the application structure with:
 * - Theme provider for dark/light mode
 * - Router configuration with lazy-loaded pages
 * - Global navigation (navbar, sidebar, mobile nav)
 * - Search palette with keyboard shortcuts (Cmd/Ctrl+K, /)
 * - Accessibility features (skip links, scroll progress)
 * - Suspense boundaries with loading skeletons
 */

import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import SkipToContent from './components/SkipToContent'
import SearchPalette from './components/SearchPalette'
import ScrollProgress from './components/ScrollProgress'
import MobileNav from './components/MobileNav'
import { PageSkeleton } from './components/Skeleton'
import { ThemeProvider } from './context/ThemeProvider'
import { preloadSearchIndex } from './utils/searchIndex'

// Lazy-loaded page components for code splitting
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
const NotFound = lazy(() => import('./pages/NotFound'))

/**
 * Main App component that orchestrates the entire application.
 *
 * Features:
 * - Manages sidebar and search palette state
 * - Implements global keyboard shortcuts (Cmd/Ctrl+K for search, / for search)
 * - Handles route-based state resets (closes sidebar, scrolls to top)
 * - Prevents background scrolling when mobile sidebar is open
 * - Lazy loads all pages for optimal performance
 *
 * @returns The complete application UI
 */
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  // Preload search index on mount (when idle) to prevent jank on first search
  useEffect(() => {
    const controller = new AbortController()
    preloadSearchIndex(controller.signal)
    return () => {
      controller.abort()
    }
  }, [])

  // Close sidebar + scroll to top on navigation (with View Transition if supported)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    document.body.classList.toggle('sidebar-open', sidebarOpen)
    return () => {
      document.body.classList.remove('sidebar-open')
    }
  }, [sidebarOpen])

  // Global ⌘K / Ctrl+K shortcut to open search
  const handleOpenSearch = useCallback(() => setSearchOpen(true), [])
  const handleCloseSearch = useCallback(() => setSearchOpen(false), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
      // "/" shortcut to open search (when not in an input)
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
          return
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <ThemeProvider>
      <div className="app-layout">
        <SkipToContent />
        <ScrollProgress />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenSearch={handleOpenSearch}
        />
        <SearchPalette isOpen={searchOpen} onClose={handleCloseSearch} />
        <main className="main-content" id="main-content" tabIndex={-1}>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <MobileNav />
      </div>
    </ThemeProvider>
  )
}
