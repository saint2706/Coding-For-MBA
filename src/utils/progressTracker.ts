/**
 * Progress tracker compatibility layer.
 *
 * Legacy callsites still import this module. Internally, all reads/writes route
 * through the zustand progress store.
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

export function markLessonComplete(day: number): void {
  ensureHydrated()
  useProgressStore.getState().markLessonComplete(day)
}

export function markLessonIncomplete(day: number): void {
  ensureHydrated()
  useProgressStore.getState().markLessonIncomplete(day)
}

export function isLessonComplete(day: number): boolean {
  ensureHydrated()
  return useProgressStore.getState().isLessonComplete(day)
}

export function toggleLessonComplete(day: number): boolean {
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

export function getCompletedForPhase(phaseLessonDays: number[]): number[] {
  ensureHydrated()
  return useProgressStore.getState().getCompletedForPhase(phaseLessonDays)
}

export function setLastVisited(day: number): void {
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

export function getPhaseProgress(phaseLessonDays: number[]): {
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
