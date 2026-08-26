import { completeLesson } from '../../../src/utils/completeLesson'
import { useProgressStore } from '../../../src/stores/progressStore'
import { useGamificationStore } from '../../../src/stores/gamificationStore'

const mockTriggerSparkle = vi.fn()
const mockTriggerPhaseUnlockConfetti = vi.fn()
const mockTriggerCurriculumFireworks = vi.fn()
const mockToastSuccess = vi.fn()

vi.mock('../../../src/utils/confetti', () => ({
  triggerSparkle: (...args: unknown[]) => mockTriggerSparkle(...args),
  triggerPhaseUnlockConfetti: (...args: unknown[]) => mockTriggerPhaseUnlockConfetti(...args),
  triggerCurriculumFireworks: (...args: unknown[]) => mockTriggerCurriculumFireworks(...args),
}))

vi.mock('../../../src/utils/toast', () => ({
  toastSuccess: (...args: unknown[]) => mockToastSuccess(...args),
}))

const LESSONS_BY_PHASE: Record<number, Array<{ day: string }>> = {
  1: [{ day: '1' }, { day: '2' }],
  2: [{ day: '3' }],
}

vi.mock('../../../src/utils/contentLoader', () => ({
  getLesson: (day: string | number) => {
    const dayStr = String(day)
    for (const [phase, lessons] of Object.entries(LESSONS_BY_PHASE)) {
      if (lessons.some((l) => l.day === dayStr)) {
        return { day: dayStr, phase: Number(phase) }
      }
    }
    return undefined
  },
  getLessonsByPhase: (phase: number) => LESSONS_BY_PHASE[phase] ?? [],
  getPhase: (phase: number) => (LESSONS_BY_PHASE[phase] ? { phase } : undefined),
  getCurriculumMetadata: () => ({
    totalDays: Object.values(LESSONS_BY_PHASE).flat().length,
    totalPhases: Object.keys(LESSONS_BY_PHASE).length,
    totalLevels: 1,
  }),
}))

describe('completeLesson', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useProgressStore.setState({
      completedLessons: [],
      completionDates: {},
      lastVisitedLesson: null,
      hasHydrated: true,
    })
    useGamificationStore.setState({
      xpTotal: 0,
      xpByDay: {},
      achievementsUnlocked: [],
      dailyChallenge: { day: 1, dateKey: '' },
      leaderboard: [{ name: 'You', xp: 0, updatedAt: new Date(0).toISOString() }],
      perfectQuizIds: [],
      lessonXpAwardedDays: [],
      completedExerciseIds: [],
      lessonsCompletedByDate: {},
      hasHydrated: true,
    })
  })

  it('marks the lesson complete and awards XP', () => {
    const didComplete = completeLesson(1)

    expect(didComplete).toBe(true)
    expect(useProgressStore.getState().completedLessons).toContain(1)
    expect(useGamificationStore.getState().xpTotal).toBe(10)
    // completeLesson triggers a sparkle directly, and completing the first
    // lesson also unlocks the "first-lesson" achievement, which triggers its
    // own sparkle via the gamification store — so at least one is guaranteed.
    expect(mockTriggerSparkle).toHaveBeenCalled()
  })

  it('is idempotent for an already-complete lesson', () => {
    completeLesson(1)
    mockTriggerSparkle.mockClear()
    const secondXpTotal = useGamificationStore.getState().xpTotal

    const didCompleteAgain = completeLesson(1)

    expect(didCompleteAgain).toBe(false)
    expect(mockTriggerSparkle).not.toHaveBeenCalled()
    expect(useGamificationStore.getState().xpTotal).toBe(secondXpTotal)
  })

  it('celebrates unlocking the next phase once its last lesson completes', () => {
    completeLesson(1)
    expect(mockTriggerPhaseUnlockConfetti).not.toHaveBeenCalled()

    completeLesson(2)

    expect(mockTriggerPhaseUnlockConfetti).toHaveBeenCalledTimes(1)
    expect(mockToastSuccess).toHaveBeenCalledWith('Phase 2 unlocked!')
  })

  it('celebrates finishing the whole curriculum', () => {
    completeLesson(1)
    completeLesson(2)
    mockToastSuccess.mockClear()

    completeLesson(3)

    expect(mockTriggerCurriculumFireworks).toHaveBeenCalledTimes(1)
    expect(mockToastSuccess).toHaveBeenCalledWith('Curriculum complete! Incredible work.')
  })

  it('accepts a pre-fetched lesson to skip the getLesson lookup', () => {
    completeLesson(1, { lesson: { phase: 1 } })
    completeLesson(2, { lesson: { phase: 1 } })

    expect(mockTriggerPhaseUnlockConfetti).toHaveBeenCalledTimes(1)
  })
})
