import { describe, it, expect, beforeEach, vi } from 'vitest'
import { markExerciseComplete } from '../exerciseProgress'

describe('exerciseProgress', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('should mark an exercise as complete', () => {
    const day = 1
    const exerciseId = 'ex1'
    const totalForDay = 5

    const result = markExerciseComplete(day, exerciseId, totalForDay)

    expect(result).toBe(false)
    const progress = JSON.parse(localStorage.getItem('coding-for-mba-exercise-progress') || '{}')
    expect(progress['1']).toContain('ex1')
  })

  it('should trigger celebration when all exercises are completed', () => {
    const day = 1
    const totalForDay = 2

    // Mark first exercise
    markExerciseComplete(day, 'ex1', totalForDay)

    // Mark second exercise
    const result = markExerciseComplete(day, 'ex2', totalForDay)

    expect(result).toBe(true)
    const celebrations = JSON.parse(localStorage.getItem('coding-for-mba-exercise-day-celebration') || '{}')
    expect(celebrations['1']).toContain('done')
  })

  it('should not trigger celebration if already celebrated', () => {
    const day = 1
    const totalForDay = 1

    // First completion triggers celebration
    markExerciseComplete(day, 'ex1', totalForDay)

    // Simulate re-completion
    const result = markExerciseComplete(day, 'ex1', totalForDay)

    expect(result).toBe(false)
  })

  it('should handle existing progress correctly', () => {
    const day = 1
    localStorage.setItem('coding-for-mba-exercise-progress', JSON.stringify({
      '1': ['ex1']
    }))

    const result = markExerciseComplete(day, 'ex2', 2)

    expect(result).toBe(true)
    const progress = JSON.parse(localStorage.getItem('coding-for-mba-exercise-progress') || '{}')
    expect(progress['1']).toEqual(['ex1', 'ex2'])
  })
})
