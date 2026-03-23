import { useGamificationStore, hydrateGamificationStore } from '../gamificationStore'
import { useProgressStore } from '../progressStore'

vi.mock('../../utils/confetti', () => ({
  triggerSparkle: vi.fn(),
}))

vi.mock('../../utils/toast', () => ({
  toastSuccess: vi.fn(),
}))

describe('gamificationStore', () => {
  beforeEach(() => {
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

  it('awards lesson XP only once per lesson day', () => {
    useProgressStore.getState().markLessonComplete(5)
    useGamificationStore.getState().awardLessonCompletion(5, new Date('2026-04-01T11:00:00'))
    useGamificationStore.getState().awardLessonCompletion(5, new Date('2026-04-01T12:00:00'))

    const state = useGamificationStore.getState()
    expect(state.xpTotal).toBe(10)
    expect(state.xpByDay[5]).toBe(10)
  })

  it('awards exercise and perfect-quiz XP once', () => {
    const store = useGamificationStore.getState()
    store.awardExerciseCompletion(3, '3-loop-exercise')
    store.awardExerciseCompletion(3, '3-loop-exercise')
    store.awardPerfectQuiz('quiz-day-3')
    store.awardPerfectQuiz('quiz-day-3')

    const state = useGamificationStore.getState()
    expect(state.xpTotal).toBe(25)
    expect(state.xpByDay[3]).toBe(5)
    expect(state.perfectQuizIds).toEqual(['quiz-day-3'])
  })

  it('ignores invalid days when awarding lesson XP', () => {
    useGamificationStore.getState().awardLessonCompletion(0)
    useGamificationStore.getState().awardLessonCompletion(-1)
    useGamificationStore.getState().awardLessonCompletion(1.5)

    const state = useGamificationStore.getState()
    expect(state.xpTotal).toBe(0)
    expect(state.lessonXpAwardedDays).toHaveLength(0)
  })

  it('ignores invalid parameters when awarding exercise XP', () => {
    useGamificationStore.getState().awardExerciseCompletion(0, 'ex-1')
    useGamificationStore.getState().awardExerciseCompletion(1, '')
    useGamificationStore.getState().awardExerciseCompletion(1, '   ')

    const state = useGamificationStore.getState()
    expect(state.xpTotal).toBe(0)
    expect(state.completedExerciseIds).toHaveLength(0)
  })

  it('ignores invalid parameters when awarding perfect quiz', () => {
    useGamificationStore.getState().awardPerfectQuiz('')
    useGamificationStore.getState().awardPerfectQuiz('   ')

    const state = useGamificationStore.getState()
    expect(state.xpTotal).toBe(0)
    expect(state.perfectQuizIds).toHaveLength(0)
  })

  it('calculates xpToNextMilestone correctly', () => {
    const store = useGamificationStore.getState()

    // Initial state: 0 XP, next is 50
    let milestone = store.xpToNextMilestone()
    expect(milestone.current).toBe(0)
    expect(milestone.next).toBe(50)
    expect(milestone.percent).toBe(0)

    // Mid-way to 50
    useGamificationStore.setState({ xpTotal: 25 })
    milestone = store.xpToNextMilestone()
    expect(milestone.percent).toBe(50)

    // Reached 50, next is 150
    useGamificationStore.setState({ xpTotal: 50 })
    milestone = store.xpToNextMilestone()
    expect(milestone.next).toBe(150)
    expect(milestone.percent).toBe(0)

    // Mid-way to 150
    useGamificationStore.setState({ xpTotal: 100 })
    milestone = store.xpToNextMilestone()
    expect(milestone.percent).toBe(50)

    // Max XP
    useGamificationStore.setState({ xpTotal: 1000 })
    milestone = store.xpToNextMilestone()
    expect(milestone.next).toBeNull()
    expect(milestone.percent).toBe(100)

    // Beyond max XP
    useGamificationStore.setState({ xpTotal: 2000 })
    milestone = store.xpToNextMilestone()
    expect(milestone.next).toBeNull()
    expect(milestone.percent).toBe(100)
  })

  it('gets achievement meta', () => {
    const meta = useGamificationStore.getState().getAchievementMeta('first-lesson')
    expect(meta).not.toBeNull()
    expect(meta?.id).toBe('first-lesson')

    const invalid = useGamificationStore.getState().getAchievementMeta('invalid-id')
    expect(invalid).toBeNull()
  })

  it('unlocks achievements for streak, night owl, speed runner, and quiz master', () => {
    const now = new Date('2026-05-07T22:30:00')

    useProgressStore.setState({
      completionDates: {
        1: '2026-05-01',
        2: '2026-05-02',
        3: '2026-05-03',
        4: '2026-05-04',
        5: '2026-05-05',
        6: '2026-05-06',
      },
      completedLessons: [1, 2, 3, 4, 5, 6],
    })

    useProgressStore.getState().markLessonComplete(7, now)
    useGamificationStore.getState().awardLessonCompletion(7, now)
    useGamificationStore.getState().awardLessonCompletion(8, now)
    useGamificationStore.getState().awardLessonCompletion(9, now)

    useGamificationStore.getState().awardPerfectQuiz('q-1')
    useGamificationStore.getState().awardPerfectQuiz('q-2')
    useGamificationStore.getState().awardPerfectQuiz('q-3')

    const unlocked = useGamificationStore.getState().achievementsUnlocked
    expect(unlocked).toEqual(
      expect.arrayContaining([
        'first-lesson',
        'streak-7',
        'night-owl',
        'speed-runner',
        'quiz-master',
      ]),
    )
  })

  describe('refreshDailyChallenge', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('sets a new daily challenge if none exists for today', () => {
      vi.setSystemTime(new Date('2026-05-01T12:00:00Z'))

      // Setup some completed lessons
      useProgressStore.setState({
        completedLessons: [1, 2, 3],
      })

      useGamificationStore.getState().refreshDailyChallenge()

      const state = useGamificationStore.getState()
      expect(state.dailyChallenge.dateKey).toBe('2026-05-01')
      expect(state.dailyChallenge.day).toBeGreaterThanOrEqual(1)
      expect(state.dailyChallenge.day).toBeLessThanOrEqual(3)
    })

    it('uses lastVisitedLesson if no completed lessons', () => {
      vi.setSystemTime(new Date('2026-05-02T12:00:00Z'))

      useProgressStore.setState({
        completedLessons: [],
        lastVisitedLesson: 5,
      })

      useGamificationStore.getState().refreshDailyChallenge()

      const state = useGamificationStore.getState()
      expect(state.dailyChallenge.dateKey).toBe('2026-05-02')
      expect(state.dailyChallenge.day).toBeGreaterThanOrEqual(1)
      expect(state.dailyChallenge.day).toBeLessThanOrEqual(5)
    })

    it('uses all lessons if no completed lessons and no last visited', () => {
      vi.setSystemTime(new Date('2026-05-03T12:00:00Z'))

      useProgressStore.setState({
        completedLessons: [],
        lastVisitedLesson: null,
      })

      useGamificationStore.getState().refreshDailyChallenge()

      const state = useGamificationStore.getState()
      expect(state.dailyChallenge.dateKey).toBe('2026-05-03')
      expect(state.dailyChallenge.day).toBeGreaterThanOrEqual(1)
    })

    it('does not update challenge if already set for today', () => {
      vi.setSystemTime(new Date('2026-05-04T12:00:00Z'))

      useGamificationStore.setState({
        dailyChallenge: { day: 10, dateKey: '2026-05-04' },
      })

      useGamificationStore.getState().refreshDailyChallenge()

      const state = useGamificationStore.getState()
      expect(state.dailyChallenge.dateKey).toBe('2026-05-04')
      expect(state.dailyChallenge.day).toBe(10) // should not change
    })
  })

  it('hydrates gamification store', () => {
    // Reset hasHydrated flag
    useGamificationStore.setState({ hasHydrated: false })

    // Mock rehydrate function
    const rehydrateSpy = vi
      .spyOn(useGamificationStore.persist, 'rehydrate')
      .mockImplementation(() => Promise.resolve())

    hydrateGamificationStore()
    expect(rehydrateSpy).toHaveBeenCalled()

    // Should not rehydrate if already hydrated
    useGamificationStore.setState({ hasHydrated: true })
    rehydrateSpy.mockClear()

    hydrateGamificationStore()
    expect(rehydrateSpy).not.toHaveBeenCalled()
  })

  it('unlocks milestones from exercises', () => {
    const store = useGamificationStore.getState()
    useGamificationStore.setState({ xpTotal: 45 })

    // Will reach 50 -> unlock xp-50
    store.awardExerciseCompletion(1, 'ex-1')
    expect(useGamificationStore.getState().achievementsUnlocked).toContain('xp-50')

    // Setup for next milestones
    useGamificationStore.setState({ xpTotal: 145, achievementsUnlocked: [] })
    store.awardExerciseCompletion(1, 'ex-2')
    expect(useGamificationStore.getState().achievementsUnlocked).toContain('xp-150')

    useGamificationStore.setState({ xpTotal: 295, achievementsUnlocked: [] })
    store.awardExerciseCompletion(1, 'ex-3')
    expect(useGamificationStore.getState().achievementsUnlocked).toContain('xp-300')
  })

  it('handles rehydration storage callback correctly', () => {
    // Rehydration storage triggers the callback
    const rehydrationCb = useGamificationStore.persist
      .getOptions()
      .onRehydrateStorage?.(useGamificationStore.getState())

    if (rehydrationCb) {
      // Simulate state rehydrated properly
      const refreshSpy = vi.spyOn(useGamificationStore.getState(), 'refreshDailyChallenge')

      // Call with no state (should do nothing)
      rehydrationCb(undefined)
      expect(useGamificationStore.getState().hasHydrated).toBe(true) // already true from beforeEach
      expect(refreshSpy).not.toHaveBeenCalled()

      // Reset state for actual test
      useGamificationStore.setState({ hasHydrated: false })

      // Call with state (should set hydrated and refresh daily challenge)
      rehydrationCb(useGamificationStore.getState())
      expect(useGamificationStore.getState().hasHydrated).toBe(true)
      expect(refreshSpy).toHaveBeenCalled()
    }
  })
})
