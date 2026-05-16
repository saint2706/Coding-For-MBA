import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  markLessonComplete,
  markLessonIncomplete,
  isLessonComplete,
  toggleLessonComplete,
  getCompletedLessons,
  getCompletedCount,
  getCompletedForPhase,
  setLastVisited,
  getLastVisited,
  clearAllProgress,
  getPhaseProgress,
  getStreakDays,
  hydrateProgressStore,
} from '../progressTracker'
import { useProgressStore } from '../../stores/progressStore'

// Mock the store explicitly
vi.mock('../../stores/progressStore', () => ({
  useProgressStore: {
    getState: vi.fn(),
    persist: {
      rehydrate: vi.fn(),
    },
  },
}))

describe('progressTracker', () => {
  let mockStore: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockStore = {
      hydrate: vi.fn(),
      markLessonComplete: vi.fn(),
      markLessonIncomplete: vi.fn(),
      isLessonComplete: vi.fn(),
      toggleLessonComplete: vi.fn(),
      completedLessons: [1, 2],
      completedLessonsCount: vi.fn().mockReturnValue(2),
      getCompletedForPhase: vi.fn().mockReturnValue([1]),
      setLastVisited: vi.fn(),
      lastVisitedLesson: 5,
      clearAllProgress: vi.fn(),
      phaseProgress: vi.fn().mockReturnValue({ completed: 1, total: 3, percent: 33 }),
      streakDays: vi.fn().mockReturnValue(5),
    }
    ;(useProgressStore.getState as any).mockReturnValue(mockStore)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Store Delegation', () => {
    it('markLessonComplete delegates to store', () => {
      markLessonComplete('1-1')
      expect(mockStore.hydrate).toHaveBeenCalled()
      expect(mockStore.markLessonComplete).toHaveBeenCalledWith('1-1')
    })

    it('markLessonIncomplete delegates to store', () => {
      markLessonIncomplete(2)
      expect(mockStore.markLessonIncomplete).toHaveBeenCalledWith(2)
    })

    it('isLessonComplete delegates to store', () => {
      mockStore.isLessonComplete.mockReturnValue(true)
      const result = isLessonComplete('2-1')
      expect(mockStore.isLessonComplete).toHaveBeenCalledWith('2-1')
      expect(result).toBe(true)
    })

    it('toggleLessonComplete delegates to store', () => {
      mockStore.toggleLessonComplete.mockReturnValue(false)
      const result = toggleLessonComplete(3)
      expect(mockStore.toggleLessonComplete).toHaveBeenCalledWith(3)
      expect(result).toBe(false)
    })

    it('getCompletedLessons returns from store', () => {
      const result = getCompletedLessons()
      expect(result).toEqual([1, 2])
    })

    it('getCompletedCount delegates to store', () => {
      const result = getCompletedCount()
      expect(mockStore.completedLessonsCount).toHaveBeenCalled()
      expect(result).toBe(2)
    })

    it('getCompletedForPhase delegates to store', () => {
      const result = getCompletedForPhase(['1-1', '1-2'])
      expect(mockStore.getCompletedForPhase).toHaveBeenCalledWith(['1-1', '1-2'])
      expect(result).toEqual([1])
    })

    it('setLastVisited delegates to store', () => {
      setLastVisited('3-1')
      expect(mockStore.setLastVisited).toHaveBeenCalledWith('3-1')
    })

    it('getLastVisited returns from store', () => {
      const result = getLastVisited()
      expect(result).toBe(5)
    })

    it('clearAllProgress delegates to store', () => {
      clearAllProgress()
      expect(mockStore.clearAllProgress).toHaveBeenCalled()
    })

    it('getPhaseProgress delegates to store', () => {
      const result = getPhaseProgress(['2-1'])
      expect(mockStore.phaseProgress).toHaveBeenCalledWith(['2-1'])
      expect(result).toEqual({ completed: 1, total: 3, percent: 33 })
    })

    it('getStreakDays delegates to store', () => {
      const date = new Date()
      const result = getStreakDays(date)
      expect(mockStore.streakDays).toHaveBeenCalledWith(date)
      expect(result).toBe(5)
    })

    it('hydrateProgressStore forces hydration', () => {
      hydrateProgressStore()
      expect(mockStore.hydrate).toHaveBeenCalled()
    })
  })

  describe('Storage Events', () => {
    it('triggers rehydrate on appropriate storage event', () => {
      const rehydrateSpy = vi.spyOn(useProgressStore.persist, 'rehydrate')
      const event = new StorageEvent('storage', { key: 'coding-for-mba-progress' })
      window.dispatchEvent(event)
      expect(rehydrateSpy).toHaveBeenCalled()
    })

    it('triggers rehydrate on null key storage event', () => {
      const rehydrateSpy = vi.spyOn(useProgressStore.persist, 'rehydrate')
      const event = new StorageEvent('storage', { key: null })
      window.dispatchEvent(event)
      expect(rehydrateSpy).toHaveBeenCalled()
    })

    it('does not trigger rehydrate on unrelated storage event', () => {
      const rehydrateSpy = vi.spyOn(useProgressStore.persist, 'rehydrate')
      const event = new StorageEvent('storage', { key: 'other-key' })
      window.dispatchEvent(event)
      expect(rehydrateSpy).not.toHaveBeenCalled()
    })
  })
})
