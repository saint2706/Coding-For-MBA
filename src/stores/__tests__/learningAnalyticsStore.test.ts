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

it('covers store setup and missing coverage (migrate, partialize, hydration, error catch)', () => {
  // 1. Storage Catch Blocks (Uncovered 36, 45)
  const originalLocalStorage = global.localStorage
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: () => {
        throw new Error('Simulated get error')
      },
      setItem: () => {
        throw new Error('Simulated set error')
      },
      removeItem: () => {
        throw new Error('Simulated remove error')
      },
    },
    writable: true,
    configurable: true,
  })

  const options = useLearningAnalyticsStore.persist.getOptions()
  const storage = options.storage!
  expect(storage.getItem('test')).toBe(null) // Should catch and return null
  expect(() =>
    storage.setItem(
      'test',
      'value' as unknown as import('zustand/middleware').StorageValue<unknown>,
    ),
  ).not.toThrow() // Should ignore
  expect(() => storage.removeItem('test')).not.toThrow() // Should ignore

  // Restore localStorage
  Object.defineProperty(global, 'localStorage', { value: originalLocalStorage })

  // 2. hydrate and onRehydrateStorage (316-318)
  const onRehydrate = options.onRehydrateStorage?.(useLearningAnalyticsStore.getState())

  // Test with undefined state
  if (onRehydrate) {
    onRehydrate(undefined)
    // Test with actual state
    useLearningAnalyticsStore.setState({ hasHydrated: false })
    onRehydrate(useLearningAnalyticsStore.getState())
    expect(useLearningAnalyticsStore.getState().hasHydrated).toBe(true)
  }

  // 3. partialize (309-313)
  const partial = options.partialize!(useLearningAnalyticsStore.getState())
  expect(partial).toHaveProperty('timeByLessonDay')
  expect(partial).toHaveProperty('timeByDate')
  expect(partial).toHaveProperty('visitsByLessonDay')

  // 4. migrate (314) and normalizePersistedState logic
  const migratedState = options.migrate!(
    { timeByLessonDay: 'invalid' },
    1,
  ) as unknown as ReturnType<typeof useLearningAnalyticsStore.getState>
  expect(migratedState.timeByLessonDay).toEqual({})

  // 5. todayLearningMs (286)
  useLearningAnalyticsStore.getState().clearAnalytics()
  useLearningAnalyticsStore.setState({ timeByDate: { '2023-01-01': 1000 } })
  const todayLearning = useLearningAnalyticsStore
    .getState()
    .todayLearningMs(new Date('2023-01-01T12:00:00Z'))
  expect(todayLearning).toBe(1000)
  expect(
    useLearningAnalyticsStore.getState().todayLearningMs(new Date('2023-01-02T12:00:00Z')),
  ).toBe(0)
})

it('covers hydration edge cases and hydrate method', () => {
  // 211-213: hydrate method
  const rehydrateSpy = vi
    .spyOn(useLearningAnalyticsStore.persist, 'rehydrate')
    .mockResolvedValue(undefined)
  useLearningAnalyticsStore.setState({ hasHydrated: false })
  useLearningAnalyticsStore.getState().hydrate()
  expect(rehydrateSpy).toHaveBeenCalled()

  rehydrateSpy.mockClear()
  useLearningAnalyticsStore.setState({ hasHydrated: true })
  useLearningAnalyticsStore.getState().hydrate()
  expect(rehydrateSpy).not.toHaveBeenCalled()
})

it('covers stopTracking edge case (246-250)', () => {
  // If we call stopTracking while it's already paused or not started
  useLearningAnalyticsStore.setState({ sessionStartedAt: null, isPaused: false })
  useLearningAnalyticsStore.getState().stopTracking(1000)
  expect(useLearningAnalyticsStore.getState().sessionStartedAt).toBeNull()

  useLearningAnalyticsStore.setState({ sessionStartedAt: 500, isPaused: true })
  useLearningAnalyticsStore.getState().stopTracking(1000)
  expect(useLearningAnalyticsStore.getState().sessionStartedAt).toBeNull()
})

it('covers parsing missing states or values from migrate', () => {
  const normalize = useLearningAnalyticsStore.persist.getOptions().migrate!

  // Simulate invalid records passing through Zod but caught in normalization
  const normalized = normalize(
    {
      timeByLessonDay: { a: -10, '1': 50 },
      timeByDate: { '2023-01-01': -100 },
      visitsByLessonDay: { b: 10, '2': 2 },
    },
    1,
  ) as unknown as ReturnType<typeof useLearningAnalyticsStore.getState>

  expect(normalized.timeByLessonDay).toEqual({ 1: 50 })
  expect(normalized.timeByDate).toEqual({})
  expect(normalized.visitsByLessonDay).toEqual({ 2: 2 })
})

it('covers returning default from normalize if parse fails (line 119)', () => {
  const normalize = useLearningAnalyticsStore.persist.getOptions().migrate!
  // Since Zod has catch everywhere, the only way parsed.success is false is if we pass a completely malformed object structure like a string
  const normalized = normalize('completely invalid', 1) as unknown as ReturnType<
    typeof useLearningAnalyticsStore.getState
  >
  expect(normalized.timeByLessonDay).toEqual({})
})
