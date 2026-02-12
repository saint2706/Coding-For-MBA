/**
 * Progress Tracker Module
 * 
 * Manages user progress through the curriculum using browser localStorage.
 * Tracks completed lessons and last visited lesson for persistent learning progress.
 */

/**
 * localStorage key for storing completed lesson day numbers.
 */
const STORAGE_KEY = 'coding-for-mba-progress'

/**
 * localStorage key for storing the last visited lesson day number.
 */
const LAST_VISITED_KEY = 'coding-for-mba-last-visited'

/**
 * Retrieves the set of completed lesson day numbers from localStorage.
 * 
 * @returns Set of completed lesson day numbers
 */
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

/**
 * Saves the set of completed lesson day numbers to localStorage.
 * 
 * @param completed - Set of completed lesson day numbers to persist
 */
function saveCompleted(completed: Set<number>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]))
}

/**
 * Marks a lesson as completed.
 * 
 * @param day - Day number of the lesson to mark as complete
 */
export function markLessonComplete(day: number): void {
  const completed = getCompleted()
  completed.add(day)
  saveCompleted(completed)
}

/**
 * Marks a lesson as incomplete (removes from completed set).
 * 
 * @param day - Day number of the lesson to mark as incomplete
 */
export function markLessonIncomplete(day: number): void {
  const completed = getCompleted()
  completed.delete(day)
  saveCompleted(completed)
}

/**
 * Checks if a lesson is marked as completed.
 * 
 * @param day - Day number of the lesson to check
 * @returns True if the lesson is completed, false otherwise
 */
export function isLessonComplete(day: number): boolean {
  return getCompleted().has(day)
}

/**
 * Toggles a lesson's completion status.
 * 
 * @param day - Day number of the lesson to toggle
 * @returns True if the lesson is now completed, false if now incomplete
 */
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

/**
 * Retrieves all completed lesson day numbers.
 * 
 * @returns Sorted array of completed lesson day numbers
 */
export function getCompletedLessons(): number[] {
  return [...getCompleted()].sort((a, b) => a - b)
}

/**
 * Gets the count of completed lessons.
 * 
 * @returns Total number of completed lessons
 */
export function getCompletedCount(): number {
  return getCompleted().size
}

/**
 * Filters a list of phase lesson day numbers to only completed ones.
 * 
 * @param phaseLessonDays - Array of lesson day numbers in a phase
 * @returns Array of completed lesson day numbers from the input
 */
export function getCompletedForPhase(phaseLessonDays: number[]): number[] {
  const completed = getCompleted()
  return phaseLessonDays.filter((d) => completed.has(d))
}

/**
 * Records the last visited lesson day number.
 * 
 * @param day - Day number of the lesson that was visited
 */
export function setLastVisited(day: number): void {
  localStorage.setItem(LAST_VISITED_KEY, String(day))
}

/**
 * Retrieves the last visited lesson day number.
 * 
 * @returns Last visited lesson day number, or null if none recorded
 */
export function getLastVisited(): number | null {
  const raw = localStorage.getItem(LAST_VISITED_KEY)
  if (!raw) return null
  const num = Number(raw)
  return isNaN(num) || num < 1 ? null : num
}

/**
 * Clears all stored progress data from localStorage.
 * Removes both completed lessons and last visited lesson records.
 */
export function clearAllProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(LAST_VISITED_KEY)
}
