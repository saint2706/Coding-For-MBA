/**
 * Shared lesson-completion pipeline.
 *
 * Marking a lesson complete does more than flip a flag in the progress
 * store: it also awards XP/achievements via the gamification store, and can
 * trigger phase-unlock or full-curriculum celebrations. This logic used to
 * live only inside `Lesson.tsx`'s completion handler, which meant any other
 * "mark complete" entry point (e.g. the ⌘K command palette's quick action)
 * silently skipped all of it. `completeLesson` centralizes the day-based
 * store mutations and celebration triggers so every completion entry point
 * produces the same observable state changes.
 *
 * Callers that own component-local UI state (debounce refs, their own
 * "Progress saved" toast, etc.) keep that logic themselves and just call
 * this helper for the shared part.
 */

import { useProgressStore } from '../stores/progressStore'
import { useGamificationStore } from '../stores/gamificationStore'
import { getLesson, getLessonsByPhase, getPhase, getCurriculumMetadata } from './contentLoader'
import { dayTokenToProgressId } from './dayToken'
import { toastSuccess } from './toast'
import { triggerSparkle, triggerPhaseUnlockConfetti, triggerCurriculumFireworks } from './confetti'

/** Minimal shape needed from a lesson to run phase-completion detection. */
interface LessonPhaseInfo {
  phase: number
}

interface CompleteLessonOptions {
  /**
   * The lesson being completed, if the caller already has it (avoids a
   * redundant `getLesson` lookup). Falls back to looking it up by day.
   */
  lesson?: LessonPhaseInfo
}

/**
 * Marks a lesson complete and runs every side effect that should follow
 * from that: XP award, achievement unlocks, phase-unlock celebration, and
 * curriculum-complete celebration. No-ops if the lesson is already complete.
 *
 * @param day - The lesson's day token or numeric progress id.
 * @param options - Optional pre-fetched lesson (for phase-completion detection).
 * @returns True if this call actually transitioned the lesson to complete.
 */
export function completeLesson(day: string | number, options: CompleteLessonOptions = {}): boolean {
  const progressStore = useProgressStore.getState()
  const normalizedDay = dayTokenToProgressId(day)
  const beforeCompleted = new Set(progressStore.completedLessons)
  if (beforeCompleted.has(normalizedDay)) return false

  progressStore.markLessonComplete(day)
  triggerSparkle()
  useGamificationStore.getState().awardLessonCompletion(normalizedDay)

  const lesson = options.lesson ?? getLesson(day)
  const afterCompleted = useProgressStore.getState().completedLessons
  const afterCompletedSet = new Set(afterCompleted)

  if (lesson) {
    const wasPhaseCompleted = getLessonsByPhase(lesson.phase).every((entry) =>
      beforeCompleted.has(dayTokenToProgressId(entry.day)),
    )
    const isPhaseCompleted = getLessonsByPhase(lesson.phase).every((entry) =>
      afterCompletedSet.has(dayTokenToProgressId(entry.day)),
    )

    if (!wasPhaseCompleted && isPhaseCompleted) {
      const hasNextPhase = !!getPhase(lesson.phase + 1)
      if (hasNextPhase) {
        triggerPhaseUnlockConfetti()
        toastSuccess(`Phase ${lesson.phase + 1} unlocked!`)
      }
    }
  }

  const totalLessonCount = getCurriculumMetadata().totalDays
  if (afterCompleted.length === totalLessonCount) {
    triggerCurriculumFireworks()
    toastSuccess('Curriculum complete! Incredible work.')
  }

  return true
}
