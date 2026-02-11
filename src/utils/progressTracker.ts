const STORAGE_KEY = 'coding-for-mba-progress'
const LAST_VISITED_KEY = 'coding-for-mba-last-visited'

function getCompleted(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((n): n is number => typeof n === 'number'))
  } catch {
    return new Set()
  }
}

function saveCompleted(completed: Set<number>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]))
}

export function markLessonComplete(day: number): void {
  const completed = getCompleted()
  completed.add(day)
  saveCompleted(completed)
}

export function markLessonIncomplete(day: number): void {
  const completed = getCompleted()
  completed.delete(day)
  saveCompleted(completed)
}

export function isLessonComplete(day: number): boolean {
  return getCompleted().has(day)
}

export function toggleLessonComplete(day: number): boolean {
  const completed = getCompleted()
  if (completed.has(day)) {
    completed.delete(day)
    saveCompleted(completed)
    return false
  }
  completed.add(day)
  saveCompleted(completed)
  return true
}

export function getCompletedLessons(): number[] {
  return [...getCompleted()].sort((a, b) => a - b)
}

export function getCompletedCount(): number {
  return getCompleted().size
}

export function getCompletedForPhase(phaseLessonDays: number[]): number[] {
  const completed = getCompleted()
  return phaseLessonDays.filter((d) => completed.has(d))
}

export function setLastVisited(day: number): void {
  localStorage.setItem(LAST_VISITED_KEY, String(day))
}

export function getLastVisited(): number | null {
  const raw = localStorage.getItem(LAST_VISITED_KEY)
  if (!raw) return null
  const num = Number(raw)
  return isNaN(num) ? null : num
}

export function clearAllProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(LAST_VISITED_KEY)
}
