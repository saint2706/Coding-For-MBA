/**
 * Sidebar — file-tree style curriculum navigation.
 *
 * VS Code-inspired tree: mono prefixes, indented expand/collapse,
 * left signal-lime bar marking the active item. No emoji icons —
 * mono glyphs only (per ui-ux-pro-max: no-emoji-icons).
 */

import { useMemo, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getAllPhases, getLessonsByPhase } from '../utils/contentLoader'
import { getReviewDueCountByPhase, getReviewStreak } from '../utils/reviewTracker'
import { normalizeDayToken, dayTokenToProgressId } from '../utils/dayToken'
import { useProgressStore } from '../stores/progressStore'
import SidebarPhaseGroup from './SidebarPhaseGroup'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface PrimaryItemProps {
  to: string
  active: boolean
  glyph: string
  label: string
  onClick: () => void
}

function PrimaryItem({ to, active, glyph, label, onClick }: PrimaryItemProps) {
  return (
    <Link
      to={to}
      className={`tree-item tree-item--primary ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      <span className="tree-glyph" aria-hidden="true">
        {glyph}
      </span>
      <span className="tree-label">{label}</span>
    </Link>
  )
}

/**
 * Sidebar component for navigation, displaying the curriculum phases
 * and their corresponding lessons in a collapsible tree structure.
 *
 * @param {SidebarProps} props - The component props.
 * @returns {JSX.Element} The rendered sidebar component.
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

  const completedLessons = useProgressStore((state) => state.completedLessons)
  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons])

  const completedIdsByPhase = useMemo(() => {
    const idsByPhase: Record<number, string> = {}
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i]
      if (!phase) continue
      const lessons = getLessonsByPhase(phase.phase)
      const completedIds: string[] = []
      for (let j = 0; j < lessons.length; j++) {
        const l = lessons[j]
        if (!l) continue
        const id = dayTokenToProgressId(l.day)
        if (completedSet.has(id)) {
          completedIds.push(String(id))
        }
      }
      idsByPhase[phase.phase] = completedIds.join(',')
    }
    return idsByPhase
  }, [phases, completedSet])

  const openPhase = manualOpen !== null ? manualOpen : derivedOpenPhase

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const timer = setTimeout(() => {
      const activeLink = nav.querySelector(
        '.day-link.active, .tree-item.active',
      ) as HTMLElement | null
      if (activeLink) {
        activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [location.pathname])

  const togglePhase = (phaseNum: number) => {
    setManualOpen((prev) => (prev === phaseNum ? null : phaseNum))
  }

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
        role="presentation"
      />
      <aside
        id="app-sidebar"
        className={`sidebar ${isOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Lesson navigation"
      >
        <h1 className="sr-only">Sidebar Navigation</h1>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand" onClick={onClose}>
            <span className="sidebar-brand-mark" aria-hidden="true">
              C/M
            </span>
            <span className="sidebar-brand-text">
              <span className="sidebar-brand-name">Coding for MBA</span>
              <span className="sidebar-brand-meta">v1 · 140-day</span>
            </span>
          </Link>
          <button
            type="button"
            className="sidebar-close focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            onClick={onClose}
            aria-label="Close sidebar"
            aria-expanded={isOpen}
            aria-controls="app-sidebar"
          >
            <svg
              width="16"
              height="16"
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
          <div className="tree-section">
            <h2 className="tree-section-label">workspace</h2>
            <PrimaryItem
              to="/"
              active={location.pathname === '/'}
              glyph="~"
              label="home"
              onClick={onClose}
            />
            <PrimaryItem
              to="/curriculum"
              active={location.pathname === '/curriculum'}
              glyph="▣"
              label="curriculum"
              onClick={onClose}
            />
            <PrimaryItem
              to="/concepts"
              active={location.pathname === '/concepts'}
              glyph="◈"
              label="concept map"
              onClick={onClose}
            />
            <PrimaryItem
              to="/progress"
              active={location.pathname === '/progress'}
              glyph="▤"
              label="progress"
              onClick={onClose}
            />
          </div>

          <div className="tree-section">
            <h2 className="tree-section-label">practice</h2>
            <PrimaryItem
              to="/exercises"
              active={location.pathname === '/exercises'}
              glyph="λ"
              label="exercises"
              onClick={onClose}
            />
            <PrimaryItem
              to="/case-studies"
              active={location.pathname === '/case-studies'}
              glyph="▦"
              label="case studies"
              onClick={onClose}
            />
            <PrimaryItem
              to="/review"
              active={location.pathname === '/review'}
              glyph="?"
              label={`review${reviewStreak > 0 ? ` · ${reviewStreak}d` : ''}`}
              onClick={onClose}
            />
          </div>

          <div className="tree-section">
            <h2 className="tree-section-label">curriculum · {phases.length} phases</h2>
            {phases.map((phase) => (
              <SidebarPhaseGroup
                key={phase.phase}
                phase={phase}
                isActive={openPhase === phase.phase}
                completedIdsJoined={completedIdsByPhase[phase.phase] ?? ''}
                dueCount={dueByPhase[phase.phase] || 0}
                currentPath={location.pathname}
                onToggle={togglePhase}
                onClose={onClose}
              />
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
}
