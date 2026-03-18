/**
 * Sidebar Component
 *
 * A collapsible sidebar navigation showing all phases and lessons
 * with progress tracking and hierarchical organization.
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getAllPhases } from '../utils/contentLoader'
import { getReviewDueCountByPhase, getReviewStreak } from '../utils/reviewTracker'
import { normalizeDayToken } from '../utils/dayToken'
import { useProgressStore } from '../stores/progressStore'
import SidebarPhaseGroup from './SidebarPhaseGroup'

/**
 * Props for the Sidebar component.
 *
 * @property isOpen - Whether the sidebar is visible (for mobile)
 * @property onClose - Callback to close the sidebar
 */
interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Collapsible sidebar with curriculum navigation.
 *
 * Features:
 * - Hierarchical phase and lesson organization
 * - Automatic expansion of current phase
 * - Progress indicators for completed lessons
 * - Auto-scroll to active lesson
 * - Mobile overlay with click-outside to close
 * - Phase-level progress counters
 *
 * @param isOpen - Controls sidebar visibility on mobile.
 * @param onClose - Function to close the sidebar.
 * @returns A navigation sidebar with phase accordion.
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const phases = getAllPhases()
  const navRef = useRef<HTMLDivElement>(null)

  const derivedOpenPhase = useMemo(() => {
    const lessonMatch = location.pathname.match(/\/lesson\/([^/]+)/)
    if (lessonMatch && lessonMatch[1]) {
      const dayToken = normalizeDayToken(lessonMatch[1])
      const phase = phases.find((p) => p.days && p.days.includes(dayToken))
      if (phase) return phase.phase
    }
    const phaseMatch = location.pathname.match(/\/phase\/(\d+)/)
    if (phaseMatch) return Number(phaseMatch[1])
    return null
  }, [location.pathname, phases])

  const [manualOpen, setManualOpen] = useState<number | null>(null)
  const dueByPhase = useMemo(() => getReviewDueCountByPhase(), [])
  const reviewStreak = useMemo(() => getReviewStreak(), [])

  // Reactive progress tracking
  const completedLessons = useProgressStore((state) => state.completedLessons)
  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons])

  // Determines currently open phase: manual toggle takes precedence over auto-derived.
  const openPhase = manualOpen !== null ? manualOpen : derivedOpenPhase

  /**
   * Auto-scrolls sidebar to show the active lesson link.
   * Triggered when location changes or phase expands.
   */
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    // Wait for phase accordion to expand
    const timer = setTimeout(() => {
      const activeLink = nav.querySelector('.day-link.active') as HTMLElement | null
      if (activeLink) {
        activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [location.pathname])

  /**
   * Toggles the expansion state of a phase section.
   * Overrides the auto-derived open phase.
   *
   * @param phaseNum - The phase number to toggle.
   */
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
        id="app-sidebar"
        className={`sidebar ${isOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Lesson navigation"
      >
        <div className="sidebar-header">
          <div className="sidebar-logo" aria-hidden="true">
            <span>🎓</span>
          </div>
          <div className="sidebar-title">
            Coding for MBA
            <small>108-Day Curriculum</small>
          </div>
          {reviewStreak > 0 && (
            <span className="sidebar-streak-badge" title={`${reviewStreak}-day review streak`}>
              <span aria-hidden="true">🔥</span> {reviewStreak}
            </span>
          )}
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
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

        <nav className="sidebar-nav" ref={navRef}>
          <Link
            to="/"
            className={`day-link ${location.pathname === '/' ? 'active' : ''}`}
            style={{ paddingLeft: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}
            onClick={onClose}
            aria-current={location.pathname === '/' ? 'page' : undefined}
          >
            🏠 Home
          </Link>
          <Link
            to="/curriculum"
            className={`day-link ${location.pathname === '/curriculum' ? 'active' : ''}`}
            style={{ paddingLeft: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}
            onClick={onClose}
            aria-current={location.pathname === '/curriculum' ? 'page' : undefined}
          >
            📋 Full Curriculum
          </Link>
          <Link
            to="/progress"
            className={`day-link ${location.pathname === '/progress' ? 'active' : ''}`}
            style={{ paddingLeft: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}
            onClick={onClose}
            aria-current={location.pathname === '/progress' ? 'page' : undefined}
          >
            📊 Progress
          </Link>
          <Link
            to="/exercises"
            className={`day-link ${location.pathname === '/exercises' ? 'active' : ''}`}
            style={{ paddingLeft: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}
            onClick={onClose}
            aria-current={location.pathname === '/exercises' ? 'page' : undefined}
          >
            🧪 Exercises
          </Link>

          <Link
            to="/case-studies"
            className={`day-link ${location.pathname === '/case-studies' ? 'active' : ''}`}
            style={{ paddingLeft: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}
            onClick={onClose}
            aria-current={location.pathname === '/case-studies' ? 'page' : undefined}
          >
            📂 Case Studies &amp; Projects
          </Link>

          <Link
            to="/review"
            className={`day-link ${location.pathname === '/review' ? 'active' : ''}`}
            style={{ paddingLeft: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}
            onClick={onClose}
            aria-current={location.pathname === '/review' ? 'page' : undefined}
          >
            🧠 Review
          </Link>
          <div className="sidebar-review-stats">
            <small>Review streak: {reviewStreak} day(s)</small>
          </div>

          {phases.map((phase) => (
            <SidebarPhaseGroup
              key={phase.phase}
              phase={phase}
              isActive={openPhase === phase.phase}
              completedSet={completedSet}
              dueCount={dueByPhase[phase.phase] || 0}
              currentPath={location.pathname}
              onToggle={togglePhase}
              onClose={onClose}
            />
          ))}
        </nav>
      </aside>
    </>
  )
}
