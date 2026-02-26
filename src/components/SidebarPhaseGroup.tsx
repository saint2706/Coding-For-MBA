/**
 * Sidebar Phase Group Component
 *
 * Renders a collapsible group of lessons for a single phase in the sidebar.
 * Optimized with React.memo to prevent unnecessary re-renders during navigation
 * and progress updates.
 */

import { memo } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { getLessonsByPhase, phaseIcons, type Phase } from '../utils/contentLoader'
import { dayTokenToProgressId } from '../utils/dayToken'

interface SidebarPhaseGroupProps {
  phase: Phase
  isActive: boolean
  completedSet: Set<number>
  dueCount: number
  currentPath: string
  onToggle: (phaseNum: number) => void
  onClose: () => void
}

function SidebarPhaseGroup({
  phase,
  isActive,
  completedSet,
  dueCount,
  currentPath,
  onToggle,
  onClose,
}: SidebarPhaseGroupProps) {
  const prefersReducedMotion = useReducedMotion()
  const lessons = getLessonsByPhase(phase.phase)
  const icon = phaseIcons[phase.phase - 1] || '📖'
  const completedCount = lessons.filter((l) => completedSet.has(dayTokenToProgressId(l.day))).length

  return (
    <div className="phase-group">
      <button
        className={`phase-toggle ${isActive ? 'open active' : ''}`}
        onClick={() => onToggle(phase.phase)}
        aria-expanded={isActive}
        aria-controls={`phase-${phase.phase}-days`}
      >
        <span className="phase-toggle-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="phase-toggle-label">
          Phase {phase.phase}: {phase.title}
        </span>
        <span className="phase-toggle-progress">
          <span aria-hidden="true">
            {completedCount}/{lessons.length} · 🧠 {dueCount}
          </span>
          <span className="sr-only">
            {completedCount} of {lessons.length} completed, {dueCount} reviews due
          </span>
        </span>
        <span className="phase-toggle-arrow">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            className="phase-days open"
            id={`phase-${phase.phase}-days`}
            role="region"
            aria-label={`Phase ${phase.phase} lessons`}
            initial={
              prefersReducedMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }
            }
            animate={{ opacity: 1, height: 'auto' }}
            exit={prefersReducedMotion ? { opacity: 1, height: 0 } : { opacity: 0, height: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
            >
              <Link
                to={`/phase/${phase.phase}`}
                className={`day-link ${currentPath === `/phase/${phase.phase}` ? 'active' : ''}`}
                onClick={onClose}
                aria-current={currentPath === `/phase/${phase.phase}` ? 'page' : undefined}
              >
                📄 Phase Overview
              </Link>
            </motion.div>
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.day}
                initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.16,
                  delay: prefersReducedMotion ? 0 : index * 0.012,
                }}
              >
                <Link
                  to={`/lesson/${lesson.day}`}
                  className={`day-link ${currentPath === `/lesson/${lesson.day}` ? 'active' : ''}`}
                  onClick={onClose}
                  aria-current={currentPath === `/lesson/${lesson.day}` ? 'page' : undefined}
                >
                  {completedSet.has(dayTokenToProgressId(lesson.day)) && (
                    <span className="day-link-check" aria-label="Completed">
                      ✓
                    </span>
                  )}
                  Day {lesson.day}: {lesson.title}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default memo(SidebarPhaseGroup)
