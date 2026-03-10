/**
 * Exercise Progress Persistence
 *
 * Manages the local storage of completed exercises and daily celebration flags.
 * Ensures that user progress is saved across sessions.
 *
 * Key Responsibilities:
 * - Persist completed exercise IDs by day.
 * - Track whether a "day complete" celebration has already been triggered.
 * - Provide a transactional update mechanism for marking exercises as done.
 */

import { getStoredJson, setStoredString } from './safeStorage'

const EXERCISE_PROGRESS_KEY = 'coding-for-mba-exercise-progress'
const EXERCISE_DAY_CELEBRATION_KEY = 'coding-for-mba-exercise-day-celebration'

type DayExerciseMap = Record<string, string[]>

function getMap(key: string): DayExerciseMap {
  return getStoredJson<DayExerciseMap>(
    key,
    {},
    (value): value is DayExerciseMap => typeof value === 'object' && value !== null,
  )
}

/**
 * Marks a specific exercise as complete for a given day.
 * Checks if all exercises for the day are done to potentially trigger a celebration.
 *
 * @param {number} day - The day number of the exercise.
 * @param {string} exerciseId - The unique ID of the completed exercise.
 * @param {number} totalForDay - The total number of exercises available for that day.
 * @returns {boolean} True if this completion completes the day (and it hasn't been celebrated yet), false otherwise.
 */
export function markExerciseComplete(
  day: number,
  exerciseId: string,
  totalForDay: number,
): boolean {
  const progress = getMap(EXERCISE_PROGRESS_KEY)
  const dayKey = String(day)
  const existing = new Set(progress[dayKey] ?? [])
  existing.add(exerciseId)
  progress[dayKey] = [...existing]
  setStoredString(EXERCISE_PROGRESS_KEY, JSON.stringify(progress))

  const celebrations = getMap(EXERCISE_DAY_CELEBRATION_KEY)
  const alreadyCelebrated = celebrations[dayKey]?.includes('done') ?? false
  const isAllCompleted = totalForDay > 0 && existing.size >= totalForDay

  if (isAllCompleted && !alreadyCelebrated) {
    celebrations[dayKey] = ['done']
    setStoredString(EXERCISE_DAY_CELEBRATION_KEY, JSON.stringify(celebrations))
    return true
  }

  return false
}
