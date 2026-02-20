import { useGamificationStore } from '../gamificationStore'
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
})
