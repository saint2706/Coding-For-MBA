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
    localStorage.clear()
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
    localStorage.setItem('coding-for-mba-progress', 'not-json')
    expect(getCompletedLessons()).toEqual([])

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
})
