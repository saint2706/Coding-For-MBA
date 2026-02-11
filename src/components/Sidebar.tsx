import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getAllPhases, getLessonsByPhase, phaseIcons } from '../utils/contentLoader'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const phases = getAllPhases()

  // Derive which phase should be open from the URL (no useEffect + setState needed)
  const derivedOpenPhase = useMemo(() => {
    const lessonMatch = location.pathname.match(/\/lesson\/(\d+)/)
    if (lessonMatch) {
      const dayNum = Number(lessonMatch[1])
      const phase = phases.find((p) => p.days && p.days.includes(dayNum))
      if (phase) return phase.phase
    }
    const phaseMatch = location.pathname.match(/\/phase\/(\d+)/)
    if (phaseMatch) return Number(phaseMatch[1])
    return null
  }, [location.pathname, phases])

  const [manualOpen, setManualOpen] = useState<number | null>(null)

  // Manual toggle overrides auto-derivation; resets on navigation
  const openPhase = manualOpen !== null ? manualOpen : derivedOpenPhase

  const togglePhase = (phaseNum: number) => {
    setManualOpen((prev) => (prev === phaseNum ? null : phaseNum))
  }

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`sidebar ${isOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Lesson navigation"
      >
        <div className="sidebar-header">
          <div className="sidebar-logo" aria-hidden="true">
            M
          </div>
          <div className="sidebar-title">
            Coding for MBA
            <small>108-Day Curriculum</small>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`day-link ${location.pathname === '/' ? 'active' : ''}`}
            style={{ paddingLeft: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}
            onClick={onClose}
          >
            🏠 Home
          </Link>
          <Link
            to="/curriculum"
            className={`day-link ${location.pathname === '/curriculum' ? 'active' : ''}`}
            style={{ paddingLeft: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}
            onClick={onClose}
          >
            📋 Full Curriculum
          </Link>

          {phases.map((phase) => {
            const lessons = getLessonsByPhase(phase.phase)
            const isActive = openPhase === phase.phase
            const icon = phaseIcons[phase.phase - 1] || '📖'

            return (
              <div className="phase-group" key={phase.phase}>
                <button
                  className={`phase-toggle ${isActive ? 'open active' : ''}`}
                  onClick={() => togglePhase(phase.phase)}
                  aria-expanded={isActive}
                  aria-controls={`phase-${phase.phase}-days`}
                >
                  <span className="phase-toggle-icon" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="phase-toggle-label">
                    Phase {phase.phase}: {phase.title}
                  </span>
                  <span className="phase-toggle-arrow">▶</span>
                </button>

                <div
                  className={`phase-days ${isActive ? 'open' : ''}`}
                  id={`phase-${phase.phase}-days`}
                  role="region"
                  aria-label={`Phase ${phase.phase} lessons`}
                >
                  <Link
                    to={`/phase/${phase.phase}`}
                    className={`day-link ${location.pathname === `/phase/${phase.phase}` ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    📄 Phase Overview
                  </Link>
                  {lessons.map((lesson) => (
                    <Link
                      key={lesson.day}
                      to={`/lesson/${lesson.day}`}
                      className={`day-link ${location.pathname === `/lesson/${lesson.day}` ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      Day {lesson.day}: {lesson.title}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
