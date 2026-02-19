import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import SkipToContent from './components/SkipToContent'
import ScrollProgress from './components/ScrollProgress'
import MobileNav from './components/MobileNav'
import { PageSkeleton } from './components/Skeleton'
import { ThemeProvider } from './context/ThemeProvider'
import { preloadSearchIndex } from './utils/searchIndex'

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
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    preloadSearchIndex()
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

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
        <ScrollProgress />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
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
              <Route path="/review" element={<Review />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <MobileNav />
      </div>
    </ThemeProvider>
  )
}
