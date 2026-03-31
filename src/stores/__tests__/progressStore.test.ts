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

it('covers storage catch blocks', () => {
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

  const storage = useProgressStore.persist.getOptions().storage!
  expect(storage.getItem('test')).toBe(null)
  expect(() =>
    storage.setItem(
      'test',
      'value' as unknown as import('zustand/middleware').StorageValue<unknown>,
    ),
  ).not.toThrow()
  expect(() => storage.removeItem('test')).not.toThrow()

  Object.defineProperty(global, 'localStorage', { value: originalLocalStorage })
})

it('covers migrate legacy paths', () => {
  const migrate = useProgressStore.persist.getOptions().migrate!

  // Simulate legacy string array
  const migrated1 = migrate(['1', '2'], 1) as unknown as ReturnType<
    typeof useProgressStore.getState
  >
  expect(migrated1.completedLessons).toEqual([])

  // Simulate parsing failure where state is not an object or array
  const migrated2 = migrate('not valid', 1) as unknown as ReturnType<
    typeof useProgressStore.getState
  >
  expect(migrated2.completedLessons).toEqual([])
})

it('covers hydration edge cases and hydrate method', () => {
  // 199-200: hydrate method
  const rehydrateSpy = vi.spyOn(useProgressStore.persist, 'rehydrate').mockResolvedValue(undefined)
  useProgressStore.setState({ hasHydrated: false })
  useProgressStore.getState().hydrate()
  expect(rehydrateSpy).toHaveBeenCalled()

  rehydrateSpy.mockClear()
  useProgressStore.setState({ hasHydrated: true })
  useProgressStore.getState().hydrate()
  expect(rehydrateSpy).not.toHaveBeenCalled()

  // 283-286: onRehydrateStorage
  const options = useProgressStore.persist.getOptions()
  const onRehydrate = options.onRehydrateStorage?.(useProgressStore.getState())

  if (onRehydrate) {
    onRehydrate(undefined)

    useProgressStore.setState({ hasHydrated: false })
    onRehydrate(useProgressStore.getState())
    expect(useProgressStore.getState().hasHydrated).toBe(true)
  }
})

it('covers parsing valid days and mergeLegacyLastVisited (line 143-146)', () => {
  // mergeLegacyLastVisited accesses localStorage LAST_VISITED_KEY
  const originalLocalStorage = global.localStorage
  const mockGetItem = vi.fn().mockReturnValue('42')

  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: mockGetItem,
      setItem: () => {},
      removeItem: () => {},
    },
    writable: true,
    configurable: true,
  })

  const migrate = useProgressStore.persist.getOptions().migrate!

  // Pass object with no lastVisitedLesson so it falls back to mergeLegacyLastVisited
  const migrated = migrate(
    {
      completedLessons: ['1'],
      completionDates: {},
    },
    1,
  ) as unknown as ReturnType<typeof useProgressStore.getState>

  expect(migrated.lastVisitedLesson).toBe(42)

  // Restore
  Object.defineProperty(global, 'localStorage', { value: originalLocalStorage })
})

it('covers marking lesson complete that is already complete (207)', () => {
  useProgressStore.setState({ completedLessons: [1, 2] })
  useProgressStore.getState().markLessonComplete(2) // already complete
  expect(useProgressStore.getState().completedLessons).toEqual([1, 2])
})

it('covers migrate parsing bad lastVisitedLesson', () => {
  const migrate = useProgressStore.persist.getOptions().migrate!
  // Give it a bad lastVisitedLesson to hit branch 166
  const migrated = migrate(
    {
      completedLessons: [],
      completionDates: {},
      lastVisitedLesson: -5, // negative is caught
    },
    1,
  ) as unknown as ReturnType<typeof useProgressStore.getState>
  expect(migrated.lastVisitedLesson).toBe(null) // assuming legacy doesn't have it
})

it('covers parsing bad lastVisited legacy values', () => {
  const originalLocalStorage = global.localStorage
  const mockGetItem = vi.fn().mockReturnValue('-1')

  Object.defineProperty(global, 'localStorage', {
    value: { getItem: mockGetItem },
    writable: true,
    configurable: true,
  })

  const migrate = useProgressStore.persist.getOptions().migrate!
  const migrated = migrate({ completedLessons: [] }, 1) as unknown as ReturnType<
    typeof useProgressStore.getState
  >
  expect(migrated.lastVisitedLesson).toBe(null) // Hits line 144

  Object.defineProperty(global, 'localStorage', { value: originalLocalStorage })
})

it('covers returning default from migrate if parse fails completely', () => {
  const migrate = useProgressStore.persist.getOptions().migrate!
  // safeParse fails when value is not an object or completely malformed
  const result = migrate('this is a string, not an object', 1) as unknown as ReturnType<
    typeof useProgressStore.getState
  >
  expect(result.completedLessons).toEqual([]) // Hits line 160 fallback logic
})
