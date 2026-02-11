import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Lesson from './pages/Lesson'
import PhaseOverview from './pages/PhaseOverview'
import Curriculum from './pages/Curriculum'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar + scroll to top on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/phase/:phaseNum" element={<PhaseOverview />} />
          <Route path="/lesson/:dayNum" element={<Lesson />} />
        </Routes>
      </main>
    </div>
  )
}
