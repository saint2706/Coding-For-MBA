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
