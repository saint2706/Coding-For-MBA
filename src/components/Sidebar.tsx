/**
 * Sidebar — file-tree style curriculum navigation.
 *
 * VS Code-inspired tree: mono prefixes, indented expand/collapse,
 * left signal-lime bar marking the active item. No emoji icons —
 * mono glyphs only (per ui-ux-pro-max: no-emoji-icons).
 */

import { useMemo, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X } from '@phosphor-icons/react'
import { getAllPhases, getLessonsByPhase, getCurriculumMetadata } from '../utils/contentLoader'
import { getReviewDueCountByPhase, getReviewStreak } from '../utils/reviewTracker'
import { normalizeDayToken, dayTokenToProgressId } from '../utils/dayToken'
import { useProgressStore } from '../stores/progressStore'
import { useLearningAnalyticsStore } from '../stores/learningAnalyticsStore'
import { isPhaseComplete } from '../utils/phaseProgress'
import SidebarPhaseGroup from './SidebarPhaseGroup'
import { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'

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
      {...createRoutePrefetchHandlers(to)}
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
  const { totalDays } = getCurriculumMetadata()
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

  const [manualOverrides, setManualOverrides] = useState<Record<number, boolean>>({})
  const dueByPhase = useMemo(() => getReviewDueCountByPhase(), [])
  const reviewStreak = useMemo(() => getReviewStreak(), [])

  const completedLessons = useProgressStore((state) => state.completedLessons)
  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons])
  const timeByLessonDay = useLearningAnalyticsStore((state) => state.timeByLessonDay)

  const { completedIdsByPhase, inProgressIdsByPhase, phaseDefaultOpenByPhase } = useMemo(() => {
    const completedIds: Record<number, string> = {}
    const inProgressIds: Record<number, string> = {}
    const defaultOpen: Record<number, boolean> = {}
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i]
      if (!phase) continue
      const lessons = getLessonsByPhase(phase.phase)
      const completed: string[] = []
      const inProgress: string[] = []
      for (let j = 0; j < lessons.length; j++) {
        const l = lessons[j]
        if (!l) continue
        const id = dayTokenToProgressId(l.day)
        if (completedSet.has(id)) {
          completed.push(String(id))
        } else if ((timeByLessonDay[id] || 0) > 0) {
          inProgress.push(String(id))
        }
      }
      completedIds[phase.phase] = completed.join(',')
      inProgressIds[phase.phase] = inProgress.join(',')
      // Default open only for a phase actively in progress (started, not yet
      // finished) — an untouched phase stays tidy, and a finished one collapses.
      const isStarted = completed.length > 0
      defaultOpen[phase.phase] = isStarted && !isPhaseComplete(completed.length, lessons.length)
    }
    return {
      completedIdsByPhase: completedIds,
      inProgressIdsByPhase: inProgressIds,
      phaseDefaultOpenByPhase: defaultOpen,
    }
  }, [phases, completedSet, timeByLessonDay])

  // A phase whose route is currently active always wins; otherwise an explicit
  // user toggle this session wins; otherwise a phase actively in progress
  // defaults open and everything else (untouched or finished) defaults closed.
  const isPhaseOpen = (phaseNum: number): boolean => {
    if (phaseNum === derivedOpenPhase) return true
    if (phaseNum in manualOverrides) return manualOverrides[phaseNum]!
    return phaseDefaultOpenByPhase[phaseNum] ?? false
  }

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
    setManualOverrides((prev) => ({ ...prev, [phaseNum]: !isPhaseOpen(phaseNum) }))
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
        <div className="sidebar-header">
          <Link
            to="/"
            className="sidebar-brand"
            onClick={onClose}
            {...createRoutePrefetchHandlers('/')}
          >
            <span className="sidebar-brand-mark" aria-hidden="true">
              C/M
            </span>
            <span className="sidebar-brand-text">
              <span className="sidebar-brand-name">Coding for MBA</span>
              <span className="sidebar-brand-meta">v1 · {totalDays}-day</span>
            </span>
          </Link>
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
            aria-expanded={isOpen}
            aria-controls="app-sidebar"
          >
            <X size={16} weight="bold" aria-hidden="true" />
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
              to="/notes"
              active={location.pathname === '/notes'}
              glyph="✎"
              label="notes"
              onClick={onClose}
            />
            <PrimaryItem
              to="/settings"
              active={location.pathname === '/settings'}
              glyph="⚙"
              label="settings"
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
                isActive={isPhaseOpen(phase.phase)}
                completedIdsJoined={completedIdsByPhase[phase.phase] ?? ''}
                inProgressIdsJoined={inProgressIdsByPhase[phase.phase] ?? ''}
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
