import { create } from 'zustand'
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware'

const STORAGE_KEY = 'coding-for-mba-learning-analytics'
const DAY_IN_MS = 24 * 60 * 60 * 1000
const DEFAULT_STREAK_MINUTES = 5

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
      // Ignore storage write failures.
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

type PersistedLearningAnalytics = {
  timeByLessonDay?: unknown
  timeByDate?: unknown
  visitsByLessonDay?: unknown
}

export type LearningAnalyticsStore = {
  timeByLessonDay: Record<number, number>
  timeByDate: Record<string, number>
  visitsByLessonDay: Record<number, number>
  lastActiveRoute: string | null
  lastLessonDay: number | null
  sessionStartedAt: number | null
  isPaused: boolean
  hasHydrated: boolean
  hydrate: () => void
  startTrackingRoute: (route: string, now?: number) => void
  stopTracking: (now?: number) => void
  pauseTracking: (now?: number) => void
  resumeTracking: (now?: number) => void
  clearAnalytics: () => void
  totalLearningMs: () => number
  todayLearningMs: (now?: Date) => number
  weekLearningMs: (now?: Date) => number
  getLast7Days: (now?: Date) => Array<{ date: string; ms: number }>
  studyStreakDays: (minimumMinutes?: number, now?: Date) => number
}

function asDayKey(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parsePositiveRecord(value: unknown, integerKeys = false): Record<string, number> {
  if (!value || typeof value !== 'object') return {}

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, number>>(
    (acc, [key, raw]) => {
      const numeric = typeof raw === 'number' ? raw : Number(raw)
      if (!Number.isFinite(numeric) || numeric < 0) return acc
      if (integerKeys && (!/^\d+$/.test(key) || Number(key) < 1)) return acc
      acc[key] = Math.floor(numeric)
      return acc
    },
    {},
  )
}

function normalizePersistedState(
  state: unknown,
): Pick<LearningAnalyticsStore, 'timeByLessonDay' | 'timeByDate' | 'visitsByLessonDay'> {
  const maybe = (state || {}) as PersistedLearningAnalytics

  return {
    timeByLessonDay: parsePositiveRecord(maybe.timeByLessonDay, true) as Record<number, number>,
    timeByDate: parsePositiveRecord(maybe.timeByDate),
    visitsByLessonDay: parsePositiveRecord(maybe.visitsByLessonDay, true) as Record<number, number>,
  }
}

function parseLessonDayFromRoute(route: string): number | null {
  const match = route.match(/^\/lesson\/(\d+)$/)
  if (!match) return null
  const asNumber = Number(match[1])
  return Number.isInteger(asNumber) && asNumber > 0 ? asNumber : null
}

function addElapsed(
  elapsedMs: number,
  day: number | null,
  now: Date,
  state: Pick<LearningAnalyticsStore, 'timeByDate' | 'timeByLessonDay'>,
): Pick<LearningAnalyticsStore, 'timeByDate' | 'timeByLessonDay'> {
  if (elapsedMs <= 0) return state
  const dayKey = asDayKey(now)

  return {
    timeByDate: {
      ...state.timeByDate,
      [dayKey]: (state.timeByDate[dayKey] || 0) + elapsedMs,
    },
    timeByLessonDay:
      day === null
        ? state.timeByLessonDay
        : {
            ...state.timeByLessonDay,
            [day]: (state.timeByLessonDay[day] || 0) + elapsedMs,
          },
  }
}

function streakDaysForThreshold(
  timeByDate: Record<string, number>,
  minimumMinutes: number,
  now: Date,
): number {
  const thresholdMs = minimumMinutes * 60 * 1000
  const cursor = new Date(now)
  let streak = 0

  while (true) {
    const key = asDayKey(cursor)
    if ((timeByDate[key] || 0) < thresholdMs) {
      break
    }
    streak += 1
    cursor.setTime(cursor.getTime() - DAY_IN_MS)
  }

  return streak
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0m'

  const totalMinutes = Math.floor(ms / (60 * 1000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) return `${minutes}m`
  if (minutes <= 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export const useLearningAnalyticsStore = create<LearningAnalyticsStore>()(
  persist(
    (set, get) => ({
      timeByLessonDay: {},
      timeByDate: {},
      visitsByLessonDay: {},
      lastActiveRoute: null,
      lastLessonDay: null,
      sessionStartedAt: null,
      isPaused: false,
      hasHydrated: false,
      hydrate: () => {
        if (get().hasHydrated) return
        useLearningAnalyticsStore.persist.rehydrate()
      },
      startTrackingRoute: (route, now = Date.now()) => {
        if (!route) return

        set((state) => {
          let nextState = state

          if (!state.isPaused && state.lastActiveRoute && state.sessionStartedAt !== null) {
            const elapsedMs = Math.max(0, now - state.sessionStartedAt)
            const merged = addElapsed(elapsedMs, state.lastLessonDay, new Date(now), state)
            nextState = { ...state, ...merged }
          }

          const lessonDay = parseLessonDayFromRoute(route)
          return {
            ...nextState,
            lastActiveRoute: route,
            lastLessonDay: lessonDay,
            sessionStartedAt: now,
            isPaused: false,
            visitsByLessonDay:
              lessonDay === null
                ? nextState.visitsByLessonDay
                : {
                    ...nextState.visitsByLessonDay,
                    [lessonDay]: (nextState.visitsByLessonDay[lessonDay] || 0) + 1,
                  },
          }
        })
      },
      stopTracking: (now = Date.now()) => {
        set((state) => {
          if (state.sessionStartedAt === null || state.isPaused) {
            return {
              ...state,
              sessionStartedAt: null,
            }
          }

          const elapsedMs = Math.max(0, now - state.sessionStartedAt)
          const merged = addElapsed(elapsedMs, state.lastLessonDay, new Date(now), state)
          return {
            ...state,
            ...merged,
            sessionStartedAt: null,
          }
        })
      },
      pauseTracking: (now = Date.now()) => {
        get().stopTracking(now)
        set({ isPaused: true })
      },
      resumeTracking: (now = Date.now()) => {
        const route = get().lastActiveRoute
        if (!route) return
        set({
          isPaused: false,
          sessionStartedAt: now,
        })
      },
      clearAnalytics: () => {
        set({
          timeByLessonDay: {},
          timeByDate: {},
          visitsByLessonDay: {},
          lastActiveRoute: null,
          lastLessonDay: null,
          sessionStartedAt: null,
          isPaused: false,
        })
      },
      totalLearningMs: () => Object.values(get().timeByDate).reduce((sum, value) => sum + value, 0),
      todayLearningMs: (now = new Date()) => get().timeByDate[asDayKey(now)] || 0,
      weekLearningMs: (now = new Date()) =>
        get()
          .getLast7Days(now)
          .reduce((sum, item) => sum + item.ms, 0),
      getLast7Days: (now = new Date()) => {
        return Array.from({ length: 7 }, (_, index) => {
          const date = new Date(now)
          date.setTime(date.getTime() - (6 - index) * DAY_IN_MS)
          const key = asDayKey(date)
          return {
            date: key,
            ms: get().timeByDate[key] || 0,
          }
        })
      },
      studyStreakDays: (minimumMinutes = DEFAULT_STREAK_MINUTES, now = new Date()) =>
        streakDaysForThreshold(get().timeByDate, minimumMinutes, now),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        timeByLessonDay: state.timeByLessonDay,
        timeByDate: state.timeByDate,
        visitsByLessonDay: state.visitsByLessonDay,
      }),
      migrate: (persistedState) => normalizePersistedState(persistedState),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (!state) return
        useLearningAnalyticsStore.setState({ hasHydrated: true })
      },
    },
  ),
)
