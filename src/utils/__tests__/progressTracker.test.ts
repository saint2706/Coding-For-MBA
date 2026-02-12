import {
  clearAllProgress,
  getCompletedCount,
  getCompletedForPhase,
  getCompletedLessons,
  getLastVisited,
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

  it('handles invalid stored state gracefully', () => {
    // Scenario 1: invalid storage
    localStorage.setItem('coding-for-mba-progress', 'not-json')
    expect(getCompletedLessons()).toEqual([])

    // Clear cache to simulate app restart or new session
    clearAllProgress()

    // Scenario 2: partially valid JSON
    localStorage.setItem('coding-for-mba-progress', JSON.stringify(['1', 2, null]))
    expect(getCompletedLessons()).toEqual([2])
  })

  it('stores and validates last visited lesson', () => {
    expect(getLastVisited()).toBeNull()

    setLastVisited(8)
    expect(getLastVisited()).toBe(8)

    localStorage.setItem('coding-for-mba-last-visited', '0')
    expect(getLastVisited()).toBeNull()

    localStorage.setItem('coding-for-mba-last-visited', 'abc')
    expect(getLastVisited()).toBeNull()
  })

  it('does not throw when storage is unavailable or quota exceeded', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })

    expect(() => markLessonComplete(1)).not.toThrow()
    expect(() => setLastVisited(1)).not.toThrow()

    setItemSpy.mockRestore()

    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })

    expect(() => clearAllProgress()).not.toThrow()

    removeSpy.mockRestore()
  })

  it('uses memory cache to avoid redundant storage access', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')

    // First operation - should access storage to prime cache
    markLessonComplete(1)
    expect(getItemSpy).toHaveBeenCalled()
    const callCountAfterFirst = getItemSpy.mock.calls.length

    // Second operation - should use cache and NOT access storage
    const isComplete = isLessonComplete(1)
    expect(isComplete).toBe(true)

    // Verify call count hasn't increased
    expect(getItemSpy).toHaveBeenCalledTimes(callCountAfterFirst)

    getItemSpy.mockRestore()
  })

  it('invalidates cache on storage event from another tab', () => {
    // Prime the cache
    markLessonComplete(1)
    expect(isLessonComplete(1)).toBe(true)
    expect(isLessonComplete(2)).toBe(false)

    // Simulate external change
    localStorage.setItem('coding-for-mba-progress', JSON.stringify([1, 2]))

    // Dispatch storage event (simulating cross-tab sync)
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'coding-for-mba-progress',
        newValue: JSON.stringify([1, 2]),
      }),
    )

    // Verify cache was invalidated and new data loaded
    expect(isLessonComplete(2)).toBe(true)
  })
})
