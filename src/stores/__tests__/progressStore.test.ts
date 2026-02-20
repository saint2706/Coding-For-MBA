import { useProgressStore } from '../progressStore'

describe('progressStore selectors', () => {
  beforeEach(() => {
    localStorage.clear()
    useProgressStore.setState({
      completedLessons: [],
      lastVisitedLesson: null,
      completionDates: {},
      hasHydrated: false,
    })
  })

  it('returns completed lessons filtered for a phase and count selectors', () => {
    const store = useProgressStore.getState()

    store.markLessonComplete(1, new Date('2026-03-01T10:00:00.000Z'))
    store.markLessonComplete(3, new Date('2026-03-02T10:00:00.000Z'))
    store.markLessonComplete(8, new Date('2026-03-03T10:00:00.000Z'))

    const completedForPhase = useProgressStore.getState().getCompletedForPhase([1, 2, 3, 4])

    expect(completedForPhase).toEqual([1, 3])
    expect(useProgressStore.getState().completedLessonsCount()).toBe(3)
  })

  it('computes phase progress percentages', () => {
    useProgressStore.getState().markLessonComplete(2)
    useProgressStore.getState().markLessonComplete(4)

    expect(useProgressStore.getState().phaseProgress([1, 2, 3, 4])).toEqual({
      completed: 2,
      total: 4,
      percent: 50,
    })

    expect(useProgressStore.getState().phaseProgress([])).toEqual({
      completed: 0,
      total: 0,
      percent: 0,
    })
  })

  it('toggles completion state and handles invalid days', () => {
    const store = useProgressStore.getState()

    expect(store.toggleLessonComplete(5, new Date('2026-03-01T10:00:00.000Z'))).toBe(true)
    expect(store.isLessonComplete(5)).toBe(true)

    expect(store.toggleLessonComplete(5)).toBe(false)
    expect(store.isLessonComplete(5)).toBe(false)

    store.markLessonComplete(0)
    store.markLessonIncomplete(-2)
    expect(store.toggleLessonComplete(0)).toBe(false)
    expect(useProgressStore.getState().completedLessons).toEqual([])
  })

  it('computes completion streak using unique completion days', () => {
    useProgressStore.setState({
      completionDates: {
        1: '2026-03-01',
        2: '2026-03-02',
        3: '2026-03-02',
        4: '2026-03-03',
      },
    })

    const streak = useProgressStore.getState().streakDays(new Date('2026-03-03T15:30:00.000Z'))
    expect(streak).toBe(3)

    useProgressStore.setState({
      completionDates: {
        7: '2026-03-01',
        8: '2026-03-03',
      },
    })

    const brokenStreak = useProgressStore
      .getState()
      .streakDays(new Date('2026-03-03T15:30:00.000Z'))
    expect(brokenStreak).toBe(1)
    expect(useProgressStore.getState().streakDays(new Date('2026-03-10T15:30:00.000Z'))).toBe(1)
  })

  it('sets and clears last visited state with input validation', () => {
    const store = useProgressStore.getState()

    store.setLastVisited(9)
    expect(useProgressStore.getState().lastVisitedLesson).toBe(9)

    store.setLastVisited(0)
    expect(useProgressStore.getState().lastVisitedLesson).toBe(9)

    store.clearAllProgress()
    expect(useProgressStore.getState().completedLessons).toEqual([])
    expect(useProgressStore.getState().lastVisitedLesson).toBeNull()
  })

  it('normalizes persisted state during migration', () => {
    const migrate = useProgressStore.persist.getOptions().migrate
    expect(migrate).toBeTypeOf('function')

    const migrated = migrate?.(
      {
        completedLessons: [1, 1, 3, -1, 'x'],
        lastVisitedLesson: 'bad',
        completionDates: {
          1: '2026-03-01',
          2: 'bad-date',
          '-1': '2026-03-02',
        },
      },
      1,
    )

    expect(migrated).toEqual({
      completedLessons: [1, 3],
      lastVisitedLesson: null,
      completionDates: { 1: '2026-03-01' },
    })
  })
})
