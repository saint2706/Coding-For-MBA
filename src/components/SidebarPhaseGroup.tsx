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
import { CaretRight } from '@phosphor-icons/react'
import { getLessonsByPhase, getLesson, type Phase } from '../utils/contentLoader'
import { dayTokenToProgressId } from '../utils/dayToken'
import { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'

interface SidebarPhaseGroupProps {
  phase: Phase
  isActive: boolean
  completedIdsJoined: string
  inProgressIdsJoined: string
  dueCount: number
  currentPath: string
  onToggle: (phaseNum: number) => void
  onClose: () => void
}

function SidebarPhaseGroup({
  phase,
  isActive,
  completedIdsJoined,
  inProgressIdsJoined,
  dueCount,
  currentPath,
  onToggle,
  onClose,
}: SidebarPhaseGroupProps) {
  const prefersReducedMotion = useReducedMotion()
  const lessons = getLessonsByPhase(phase.phase)
  const phaseLabel = String(phase.phase).padStart(2, '0')
  const completedCount = completedIdsJoined ? completedIdsJoined.split(',').length : 0

  // Reconstruct the Sets from the primitive string props to allow O(1) lookups during render
  // without breaking React.memo props equality checks from the parent.
  const completedSet = new Set(completedIdsJoined ? completedIdsJoined.split(',').map(Number) : [])
  const inProgressSet = new Set(
    inProgressIdsJoined ? inProgressIdsJoined.split(',').map(Number) : [],
  )

  return (
    <div className="phase-group">
      <button
        type="button"
        className={`phase-toggle ${isActive ? 'open active' : ''}`}
        onClick={() => onToggle(phase.phase)}
        aria-expanded={isActive}
        aria-controls={`phase-${phase.phase}-days`}
        aria-label={`Toggle phase ${phase.phase}`}
      >
        <span className="phase-toggle-arrow" aria-hidden="true">
          <CaretRight size={10} weight="bold" />
        </span>
        <span className="phase-toggle-num" aria-hidden="true">
          {phaseLabel}
        </span>
        <span className="phase-toggle-label">{phase.title}</span>
        <span className="phase-toggle-progress">
          <span aria-hidden="true">
            {completedCount}/{lessons.length}
            {dueCount > 0 && <span className="phase-due">·{dueCount}</span>}
          </span>
          <span className="sr-only">
            {completedCount} of {lessons.length} completed, {dueCount} reviews due
          </span>
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
                className={`day-link day-link--overview ${currentPath === `/phase/${phase.phase}` ? 'active' : ''}`}
                onClick={onClose}
                aria-current={currentPath === `/phase/${phase.phase}` ? 'page' : undefined}
                {...createRoutePrefetchHandlers(`/phase/${phase.phase}`)}
              >
                <span className="day-link-prefix" aria-hidden="true">
                  ▸
                </span>
                <span className="day-link-text">overview</span>
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
                  {...createRoutePrefetchHandlers(`/lesson/${lesson.day}`)}
                >
                  {(() => {
                    const isCompleted = completedSet.has(dayTokenToProgressId(lesson.day))
                    const isInProgress =
                      !isCompleted && inProgressSet.has(dayTokenToProgressId(lesson.day))
                    return (
                      <>
                        <span
                          className={`day-link-prefix ${isCompleted ? 'completed' : ''} ${isInProgress ? 'in-progress' : ''}`}
                          aria-hidden="true"
                        >
                          {isCompleted ? '✓' : isInProgress ? '●' : '·'}
                        </span>
                        <span className="day-link-num" aria-hidden="true">
                          {lesson.day}
                        </span>
                        <span className="day-link-text">{lesson.title}</span>
                        {isCompleted && <span className="sr-only">Completed.</span>}
                        {isInProgress && <span className="sr-only">In progress.</span>}
                      </>
                    )
                  })()}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Custom props comparison function for memoizing SidebarPhaseGroup.
 * @param {SidebarPhaseGroupProps} prevProps - Previous props.
 * @param {SidebarPhaseGroupProps} nextProps - Next props.
 * @returns {boolean} True if props are equal, false otherwise.
 */
function propsAreEqual(
  prevProps: Readonly<SidebarPhaseGroupProps>,
  nextProps: Readonly<SidebarPhaseGroupProps>,
): boolean {
  if (prevProps.isActive !== nextProps.isActive) return false
  if (prevProps.dueCount !== nextProps.dueCount) return false
  if (prevProps.phase.phase !== nextProps.phase.phase) return false

  // Only re-render if currentPath changes to/from a lesson in THIS phase
  // Optimization: check if either the old path or the new path is relevant to this phase
  const isRelevantPath = (path: string) => {
    if (path === `/phase/${nextProps.phase.phase}`) return true
    if (path.startsWith('/lesson/')) {
      const match = path.match(/\/lesson\/(.+)/)
      if (match && match[1]) {
        const lesson = getLesson(match[1])
        return lesson?.phase === nextProps.phase.phase
      }
    }
    return false
  }

  if (prevProps.currentPath !== nextProps.currentPath) {
    if (isRelevantPath(prevProps.currentPath) || isRelevantPath(nextProps.currentPath)) {
      return false
    }
  }

  // Check if completion status of ANY lesson IN THIS PHASE changed
  if (prevProps.completedIdsJoined !== nextProps.completedIdsJoined) {
    return false
  }

  // Check if in-progress status of ANY lesson IN THIS PHASE changed
  if (prevProps.inProgressIdsJoined !== nextProps.inProgressIdsJoined) {
    return false
  }

  return true
}

/**
 * Renders an accordion group of lessons for a specific phase in the sidebar curriculum.
 * Memoized to prevent re-rendering when navigation occurs outside of the current phase.
 *
 * @param {SidebarPhaseGroupProps} props - The component props.
 * @returns {JSX.Element} The phase group accordion block.
 */
export { propsAreEqual }
/**
 * @returns {JSX.Element} The rendered SidebarPhaseGroup component.
 */
export default memo(SidebarPhaseGroup, propsAreEqual)
