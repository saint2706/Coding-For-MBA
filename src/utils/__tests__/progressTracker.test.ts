import {
  clearAllProgress,
  getCompletedCount,
  getCompletedForPhase,
  getCompletedLessons,
  getLastVisited,
  getPhaseProgress,
  getStreakDays,
  isLessonComplete,
  markLessonComplete,
  markLessonIncomplete,
  setLastVisited,
  toggleLessonComplete,
} from '../progressTracker'

describe('progressTracker', () => {
  beforeEach(() => {
    clearAllProgress()
  })

  it('marks lessons complete/incomplete and returns sorted completed lessons', () => {
    markLessonComplete(5)
    markLessonComplete(2)
    markLessonComplete(2)

    expect(isLessonComplete(2)).toBe(true)
    expect(getCompletedCount()).toBe(2)
    expect(getCompletedLessons()).toEqual([2, 5])

    markLessonIncomplete(2)
    expect(getCompletedLessons()).toEqual([5])
  })

  it('toggles completion and filters by phase list', () => {
    expect(toggleLessonComplete(10)).toBe(true)
    expect(toggleLessonComplete(12)).toBe(true)
    expect(toggleLessonComplete(10)).toBe(false)

    expect(getCompletedForPhase([9, 10, 12, 14])).toEqual([12])
  })

  it('stores and validates last visited lesson in zustand store', () => {
    expect(getLastVisited()).toBeNull()

    setLastVisited(8)
    expect(getLastVisited()).toBe(8)

    setLastVisited(0)
    expect(getLastVisited()).toBe(8)
  })

  it('provides computed selectors for phase progress and streak', () => {
    markLessonComplete(1)
    markLessonComplete(2)
    markLessonComplete(5)

    expect(getPhaseProgress([1, 2, 3, 4])).toEqual({ completed: 2, total: 4, percent: 50 })
    expect(getStreakDays()).toBe(1)
  })

  it('does not throw when storage is unavailable or quota exceeded', () => {
    const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })

    expect(() => markLessonComplete(1)).not.toThrow()
    expect(() => setLastVisited(1)).not.toThrow()

    setItemSpy.mockRestore()

    const removeSpy = vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })

    expect(() => clearAllProgress()).not.toThrow()

    removeSpy.mockRestore()
  })

  it('hydrates migrated legacy state on storage events', () => {
    localStorage.setItem(
      'coding-for-mba-progress',
      JSON.stringify({
        state: {
          completedLessons: [1, 4],
          lastVisitedLesson: 4,
          completionDates: { 1: '2026-02-18', 4: '2026-02-19' },
        },
        version: 2,
      }),
    )

    window.dispatchEvent(new StorageEvent('storage', { key: 'coding-for-mba-progress' }))

    expect(getCompletedLessons()).toEqual([1, 4])
    expect(getLastVisited()).toBe(4)
    expect(getCompletedForPhase([2, 4, 9])).toEqual([4])
  })
})
