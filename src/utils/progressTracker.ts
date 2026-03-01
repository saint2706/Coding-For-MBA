/**
 * Legacy Progress Tracker (Facade)
 *
 * Provides a backward-compatible procedural API for the Progress Store.
 * Used by older components or non-React contexts to interact with the global state.
 *
 * Key Responsibilities:
 * - Wrap Zustand's `useProgressStore` methods for direct invocation.
 * - Ensure hydration before access.
 * - Listen for storage events to sync state across tabs.
 */

import { useProgressStore } from '../stores/progressStore'

const STORAGE_KEY = 'coding-for-mba-progress'

let hasAttemptedHydration = false

function ensureHydrated(): void {
  if (hasAttemptedHydration) return
  hasAttemptedHydration = true
  useProgressStore.getState().hydrate()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      useProgressStore.persist.rehydrate()
    }
  })
}

/**
 * Marks a lesson as complete.
 * @param {string | number} day - The day token or number of the lesson to mark as complete.
 * @returns {void}
 */
export function markLessonComplete(day: string | number): void {
  ensureHydrated()
  useProgressStore.getState().markLessonComplete(day)
}

/**
 * Marks a lesson as incomplete.
 * @param {string | number} day - The day token or number of the lesson to mark as incomplete.
 * @returns {void}
 */
export function markLessonIncomplete(day: string | number): void {
  ensureHydrated()
  useProgressStore.getState().markLessonIncomplete(day)
}

/**
 * Checks if a lesson is complete.
 * @param {string | number} day - The day token or number of the lesson to check.
 * @returns {boolean} True if the lesson is complete, false otherwise.
 */
export function isLessonComplete(day: string | number): boolean {
  ensureHydrated()
  return useProgressStore.getState().isLessonComplete(day)
}

/**
 * Toggles the completion status of a lesson.
 * @param {string | number} day - The day token or number of the lesson to toggle.
 * @returns {boolean} The new completion status (true if complete, false if incomplete).
 */
export function toggleLessonComplete(day: string | number): boolean {
  ensureHydrated()
  return useProgressStore.getState().toggleLessonComplete(day)
}

/**
 * Gets an array of all completed lesson IDs.
 * @returns {number[]} Array of numeric progress IDs for completed lessons.
 */
export function getCompletedLessons(): number[] {
  ensureHydrated()
  return useProgressStore.getState().completedLessons
}

/**
 * Gets the total count of completed lessons.
 * @returns {number} The total count of completed lessons.
 */
export function getCompletedCount(): number {
  ensureHydrated()
  return useProgressStore.getState().completedLessonsCount()
}

/**
 * Gets the IDs of completed lessons for a specific phase.
 * @param {Array<string | number>} phaseLessonDays - An array of day tokens for the phase.
 * @returns {number[]} Array of completed progress IDs for the given phase.
 */
export function getCompletedForPhase(phaseLessonDays: Array<string | number>): number[] {
  ensureHydrated()
  return useProgressStore.getState().getCompletedForPhase(phaseLessonDays)
}

/**
 * Sets the last visited lesson day.
 * @param {string | number} day - The day token or number of the visited lesson.
 * @returns {void}
 */
export function setLastVisited(day: string | number): void {
  ensureHydrated()
  useProgressStore.getState().setLastVisited(day)
}

/**
 * Gets the last visited lesson day ID.
 * @returns {number | null} The numeric progress ID of the last visited lesson, or null if none.
 */
export function getLastVisited(): number | null {
  ensureHydrated()
  return useProgressStore.getState().lastVisitedLesson
}

/**
 * Clears all user progress.
 * @returns {void}
 */
export function clearAllProgress(): void {
  ensureHydrated()
  useProgressStore.getState().clearAllProgress()
}

/**
 * Calculates progress statistics for a given phase.
 * @param {Array<string | number>} phaseLessonDays - Array of day tokens in the phase.
 * @returns {{ completed: number; total: number; percent: number }} Progress stats for the phase.
 */
export function getPhaseProgress(phaseLessonDays: Array<string | number>): {
  completed: number
  total: number
  percent: number
} {
  ensureHydrated()
  return useProgressStore.getState().phaseProgress(phaseLessonDays)
}

/**
 * Gets the current study streak in days.
 * @param {Date} [now] - Optional current date override for calculation.
 * @returns {number} The current study streak in days.
 */
export function getStreakDays(now?: Date): number {
  ensureHydrated()
  return useProgressStore.getState().streakDays(now)
}

/**
 * Hydrates the progress store manually.
 * @returns {void}
 */
export function hydrateProgressStore(): void {
  hasAttemptedHydration = true
  useProgressStore.getState().hydrate()
}
