import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import SkipToContent from './components/SkipToContent'

const Home = lazy(() => import('./pages/Home'))
const Lesson = lazy(() => import('./pages/Lesson'))
const PhaseOverview = lazy(() => import('./pages/PhaseOverview'))
const Curriculum = lazy(() => import('./pages/Curriculum'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading page">
      <div className="page-loader-spinner" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar + scroll to top on navigation
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

  return (
    <div className="app-layout">
      <SkipToContent />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <main className="main-content" id="main-content" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/curriculum" element={<Curriculum />} />
            <Route path="/phase/:phaseNum" element={<PhaseOverview />} />
            <Route path="/lesson/:dayNum" element={<Lesson />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}
