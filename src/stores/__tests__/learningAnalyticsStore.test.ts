import { formatDuration, useLearningAnalyticsStore } from '../learningAnalyticsStore'

describe('learningAnalyticsStore', () => {
  beforeEach(() => {
    useLearningAnalyticsStore.getState().clearAnalytics()
    useLearningAnalyticsStore.setState({
      hasHydrated: false,
      isPaused: false,
      sessionStartedAt: null,
      lastActiveRoute: null,
      lastLessonDay: null,
    })
  })

  it('tracks time by lesson/day and date on route changes', () => {
    const store = useLearningAnalyticsStore.getState()

    store.startTrackingRoute('/lesson/2', 0)
    store.startTrackingRoute('/lesson/3', 120_000)
    store.stopTracking(240_000)

    const state = useLearningAnalyticsStore.getState()

    expect(state.timeByLessonDay[2]).toBe(120_000)
    expect(state.timeByLessonDay[3]).toBe(120_000)
    expect(state.totalLearningMs()).toBe(240_000)
    expect(state.visitsByLessonDay[2]).toBe(1)
    expect(state.visitsByLessonDay[3]).toBe(1)
  })

  it('pauses and resumes without double-counting hidden time', () => {
    const store = useLearningAnalyticsStore.getState()

    store.startTrackingRoute('/lesson/5', 1_000)
    store.pauseTracking(61_000)
    store.resumeTracking(120_000)
    store.stopTracking(180_000)

    const state = useLearningAnalyticsStore.getState()
    expect(state.timeByLessonDay[5]).toBe(120_000)
  })

  it('computes weekly points and study streak threshold', () => {
    useLearningAnalyticsStore.setState({
      timeByDate: {
        '2026-03-01': 6 * 60_000,
        '2026-03-02': 8 * 60_000,
        '2026-03-03': 5 * 60_000,
        '2026-03-04': 4 * 60_000,
      },
    })

    const state = useLearningAnalyticsStore.getState()
    const now = new Date('2026-03-04T12:00:00.000Z')

    expect(state.getLast7Days(now)).toHaveLength(7)
    expect(state.studyStreakDays(5, now)).toBe(0)
    expect(state.studyStreakDays(4, now)).toBe(4)
    expect(state.weekLearningMs(now)).toBe(23 * 60_000)
  })

  it('formats duration labels', () => {
    expect(formatDuration(0)).toBe('0m')
    expect(formatDuration(59 * 60_000)).toBe('59m')
    expect(formatDuration(60 * 60_000)).toBe('1h')
    expect(formatDuration(72 * 60_000)).toBe('1h 12m')
  })
})
