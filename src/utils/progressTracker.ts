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

export function markLessonComplete(day: string | number): void {
  ensureHydrated()
  useProgressStore.getState().markLessonComplete(day)
}

export function markLessonIncomplete(day: string | number): void {
  ensureHydrated()
  useProgressStore.getState().markLessonIncomplete(day)
}

export function isLessonComplete(day: string | number): boolean {
  ensureHydrated()
  return useProgressStore.getState().isLessonComplete(day)
}

export function toggleLessonComplete(day: string | number): boolean {
  ensureHydrated()
  return useProgressStore.getState().toggleLessonComplete(day)
}

export function getCompletedLessons(): number[] {
  ensureHydrated()
  return useProgressStore.getState().completedLessons
}

export function getCompletedCount(): number {
  ensureHydrated()
  return useProgressStore.getState().completedLessonsCount()
}

export function getCompletedForPhase(phaseLessonDays: Array<string | number>): number[] {
  ensureHydrated()
  return useProgressStore.getState().getCompletedForPhase(phaseLessonDays)
}

export function setLastVisited(day: string | number): void {
  ensureHydrated()
  useProgressStore.getState().setLastVisited(day)
}

export function getLastVisited(): number | null {
  ensureHydrated()
  return useProgressStore.getState().lastVisitedLesson
}

export function clearAllProgress(): void {
  ensureHydrated()
  useProgressStore.getState().clearAllProgress()
}

export function getPhaseProgress(phaseLessonDays: Array<string | number>): {
  completed: number
  total: number
  percent: number
} {
  ensureHydrated()
  return useProgressStore.getState().phaseProgress(phaseLessonDays)
}

export function getStreakDays(now?: Date): number {
  ensureHydrated()
  return useProgressStore.getState().streakDays(now)
}

export function hydrateProgressStore(): void {
  hasAttemptedHydration = true
  useProgressStore.getState().hydrate()
}
