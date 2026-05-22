/**
 * Progress Store
 *
 * The central store for tracking lesson completion and curriculum progress.
 *
 * Key Responsibilities:
 * - Mark lessons as complete/incomplete.
 * - Calculate completion percentages by phase and overall.
 * - Track the "last visited" lesson for resume functionality.
 * - Persist progress to localStorage.
 */

import { create } from 'zustand'
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware'
import { z } from 'zod'
import { getStoredString, removeStoredValue } from '../utils/safeStorage'
import { dayTokenToProgressId } from '../utils/dayToken'

const STORAGE_KEY = 'coding-for-mba-progress'
const LAST_VISITED_KEY = 'coding-for-mba-last-visited'

const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(name, value)
      }
    } catch {
      // Ignore storage write failures (private mode, quota, etc.)
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(name)
      }
    } catch {
      // Ignore storage delete failures.
    }
  },
}

type PhaseProgress = {
  completed: number
  total: number
  percent: number
}

const PersistedProgressSchema = z.object({
  completedLessons: z.array(z.unknown()).catch([]),
  lastVisitedLesson: z.unknown().nullable().catch(null),
  completionDates: z.unknown().catch({}),
})

type ProgressStore = {
  completedSet: Set<number>
  completedLessons: number[]
  lastVisitedLesson: number | null
  completionDates: Record<number, string>
  hasHydrated: boolean
  hydrate: () => void
  markLessonComplete: (day: string | number, completedAt?: Date) => void
  markLessonIncomplete: (day: string | number) => void
  toggleLessonComplete: (day: string | number, completedAt?: Date) => boolean
  isLessonComplete: (day: string | number) => boolean
  clearAllProgress: () => void
  setLastVisited: (day: string | number) => void
  getCompletedForPhase: (phaseLessonDays: Array<string | number>) => number[]
  completedLessonsCount: () => number
  phaseProgress: (phaseLessonDays: Array<string | number>) => PhaseProgress
  streakDays: (now?: Date) => number
}

function toDayKey(input: Date): string {
  const year = input.getFullYear()
  const month = `${input.getMonth() + 1}`.padStart(2, '0')
  const day = `${input.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseValidDays(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((n): n is number => Number.isInteger(n) && n > 0))].sort(
    (a, b) => a - b,
  )
}

function parseValidCompletionDates(value: unknown): Record<number, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const entries = Object.entries(value as Record<string, unknown>)
  return entries.reduce<Record<number, string>>((acc, [rawDay, date]) => {
    const day = Number(rawDay)
    if (
      Number.isInteger(day) &&
      day > 0 &&
      typeof date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      acc[day] = date
    }
    return acc
  }, {})
}

function calculateStreakDays(completionDates: Record<number, string>, now: Date): number {
  const uniqueDays = [...new Set(Object.values(completionDates))].sort((a, b) => b.localeCompare(a))
  if (!uniqueDays.length) return 0

  const daySet = new Set(uniqueDays)
  const cursor = new Date(now)

  const latestCompletion = uniqueDays[0]
  if (!latestCompletion) return 0

  if (toDayKey(cursor).localeCompare(latestCompletion) > 0) {
    const [year, month, day] = latestCompletion.split('-').map(Number)
    if (!year || !month || !day) return 0
    cursor.setFullYear(year, month - 1, day)
  }

  let streak = 0
  while (daySet.has(toDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

function mergeLegacyLastVisited(lastVisitedLesson: number | null): number | null {
  if (lastVisitedLesson !== null) return lastVisitedLesson

  const rawLegacyValue = getStoredString(LAST_VISITED_KEY)
  if (!rawLegacyValue) return null

  const asNumber = Number(rawLegacyValue)
  if (!Number.isInteger(asNumber) || asNumber < 1) return null

  return asNumber
}

function normalizePersistedState(
  state: unknown,
): Pick<
  ProgressStore,
  'completedLessons' | 'lastVisitedLesson' | 'completionDates' | 'completedSet'
> {
  if (Array.isArray(state)) {
    return {
      completedLessons: parseValidDays(state),
      completedSet: new Set(parseValidDays(state)),
      lastVisitedLesson: mergeLegacyLastVisited(null),
      completionDates: {},
    }
  }

  const parsed = PersistedProgressSchema.safeParse(state || {})

  if (parsed.success) {
    const completedLessons = parseValidDays(parsed.data.completedLessons)
    const lastVisitedRaw = parsed.data.lastVisitedLesson
    const lastVisitedLesson =
      Number.isInteger(lastVisitedRaw) && Number(lastVisitedRaw) > 0
        ? Number(lastVisitedRaw)
        : mergeLegacyLastVisited(null)

    const completionDates = parseValidCompletionDates(parsed.data.completionDates)

    return {
      completedLessons,
      completedSet: new Set(completedLessons),
      lastVisitedLesson,
      completionDates,
    }
  }

  return {
    completedLessons: [],
    completedSet: new Set<number>(),
    lastVisitedLesson: mergeLegacyLastVisited(null),
    completionDates: {},
  }
}

/**
 * Hook for accessing the progress store state.
 *
 * @returns {ProgressStore} The state of the progress store.
 */
export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      completedSet: new Set<number>(),
      lastVisitedLesson: null,
      completionDates: {},
      hasHydrated: false,
      hydrate: () => {
        if (get().hasHydrated) return
        useProgressStore.persist.rehydrate()
      },
      markLessonComplete: (day, completedAt = new Date()) => {
        const normalizedDay = dayTokenToProgressId(day)
        if (!Number.isInteger(normalizedDay) || normalizedDay < 1) return

        set((state) => {
          if (state.completedLessons.includes(normalizedDay)) return state
          return {
            completedLessons: [...state.completedLessons, normalizedDay].sort((a, b) => a - b),
            completedSet: new Set([...state.completedLessons, normalizedDay]),
            completionDates: {
              ...state.completionDates,
              [normalizedDay]: toDayKey(completedAt),
            },
          }
        })
      },
      markLessonIncomplete: (day) => {
        const normalizedDay = dayTokenToProgressId(day)
        if (!Number.isInteger(normalizedDay) || normalizedDay < 1) return

        set((state) => ({
          completedLessons: state.completedLessons.filter((value) => value !== normalizedDay),
          completedSet: new Set(state.completedLessons.filter((value) => value !== normalizedDay)),
          completionDates: Object.fromEntries(
            Object.entries(state.completionDates).filter(
              ([savedDay]) => Number(savedDay) !== normalizedDay,
            ),
          ),
        }))
      },
      toggleLessonComplete: (day, completedAt = new Date()) => {
        const normalizedDay = dayTokenToProgressId(day)
        if (!Number.isInteger(normalizedDay) || normalizedDay < 1) return false

        const isCompleted = get().completedLessons.includes(normalizedDay)
        if (isCompleted) {
          get().markLessonIncomplete(normalizedDay)
          return false
        }

        get().markLessonComplete(normalizedDay, completedAt)
        return true
      },
      isLessonComplete: (day) => get().completedLessons.includes(dayTokenToProgressId(day)),
      clearAllProgress: () => {
        set({
          completedLessons: [],
          completedSet: new Set<number>(),
          lastVisitedLesson: null,
          completionDates: {},
        })
        removeStoredValue(LAST_VISITED_KEY)
      },
      setLastVisited: (day) => {
        const normalizedDay = dayTokenToProgressId(day)
        if (!Number.isInteger(normalizedDay) || normalizedDay < 1) return
        set({ lastVisitedLesson: normalizedDay })
      },
      getCompletedForPhase: (phaseLessonDays) => {
        const completed = get().completedSet
        return phaseLessonDays
          .map((day) => dayTokenToProgressId(day))
          .filter((day) => completed.has(day))
      },
      completedLessonsCount: () => get().completedLessons.length,
      phaseProgress: (phaseLessonDays) => {
        const completed = get().getCompletedForPhase(phaseLessonDays).length
        const total = phaseLessonDays.length
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0
        return { completed, total, percent }
      },
      streakDays: (now = new Date()) => calculateStreakDays(get().completionDates, now),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        completedLessons: state.completedLessons,
        lastVisitedLesson: state.lastVisitedLesson,
        completionDates: state.completionDates,
      }),
      migrate: (persistedState) => normalizePersistedState(persistedState),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (!state) return
        useProgressStore.setState({
          hasHydrated: true,
          completedSet: new Set(state.completedLessons),
        })
        removeStoredValue(LAST_VISITED_KEY)
      },
    },
  ),
)
