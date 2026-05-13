/**
 * Gamification Store
 *
 * Manages user engagement mechanics including XP (Experience Points),
 * achievements, streaks, and daily challenges.
 *
 * Key Responsibilities:
 * - Track XP gains from lessons, exercises, and quizzes.
 * - Manage achievement unlocking logic.
 * - Persist gamification state to localStorage.
 * - Calculate level progression based on XP.
 */

import { create } from 'zustand'
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware'
import { z } from 'zod'
import { getAllPhases, getLessonsByPhase } from '../utils/contentLoader'
import { useProgressStore } from './progressStore'
import { triggerSparkle } from '../utils/confetti'
import { toastSuccess } from '../utils/toast'
import { dayTokenToProgressId } from '../utils/dayToken'

const STORAGE_KEY = 'coding-for-mba-gamification'

/**
 * Represents the unique identifier for a gamification achievement.
 */
export type AchievementId =
  | 'first-lesson'
  | 'streak-7'
  | 'night-owl'
  | 'speed-runner'
  | 'quiz-master'
  | 'xp-50'
  | 'xp-150'
  | 'xp-300'

/**
 * Metadata object defining a gamification achievement, including
 * its ID, label, description, and visual icon.
 */
export type AchievementMeta = {
  id: AchievementId
  label: string
  description: string
  icon: string
}

/**
 * A static list of all available achievements in the gamification system.
 */
export const ACHIEVEMENTS: AchievementMeta[] = [
  {
    id: 'first-lesson',
    label: 'First Lesson',
    description: 'Complete your first lesson.',
    icon: '🎯',
  },
  {
    id: 'streak-7',
    label: '7-Day Streak',
    description: 'Keep a 7-day lesson completion streak.',
    icon: '🔥',
  },
  {
    id: 'night-owl',
    label: 'Night Owl',
    description: 'Study after 10pm local time.',
    icon: '🦉',
  },
  {
    id: 'speed-runner',
    label: 'Speed Runner',
    description: 'Complete 3 lessons in one calendar day.',
    icon: '⚡',
  },
  {
    id: 'quiz-master',
    label: 'Quiz Master',
    description: 'Ace 3 unique quizzes with 100% accuracy.',
    icon: '🧠',
  },
  {
    id: 'xp-50',
    label: 'Bronze Learner',
    description: 'Reach 50 XP.',
    icon: '🥉',
  },
  {
    id: 'xp-150',
    label: 'Silver Learner',
    description: 'Reach 150 XP.',
    icon: '🥈',
  },
  {
    id: 'xp-300',
    label: 'Gold Learner',
    description: 'Reach 300 XP.',
    icon: '🥇',
  },
]

const XP_MILESTONES = [50, 150, 300, 500, 750, 1000]

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
      if (typeof window !== 'undefined') window.localStorage.setItem(name, value)
    } catch {
      // Ignore localStorage write failures.
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(name)
    } catch {
      // Ignore localStorage delete failures.
    }
  },
}

type LeaderboardEntry = {
  name: string
  xp: number
  updatedAt: string
}

type DailyChallenge = {
  day: number
  dateKey: string
}

const LeaderboardEntrySchema = z.object({
  name: z.string(),
  xp: z.number(),
  updatedAt: z.string(),
})

const DailyChallengeSchema = z.object({
  day: z.number(),
  dateKey: z.string(),
})

const PersistedGamificationSchema = z.object({
  xpTotal: z.number().catch(0),
  xpByDay: z
    .record(z.string(), z.number())
    .transform((data) => {
      const result: Record<number, number> = {}
      for (const key in data) {
        const val = data[key]
        if (val !== undefined) {
          result[Number(key)] = val
        }
      }
      return result
    })
    .catch({}),
  achievementsUnlocked: z.array(z.string()).catch([]),
  dailyChallenge: DailyChallengeSchema.catch({ day: 1, dateKey: '' }),
  leaderboard: z
    .array(LeaderboardEntrySchema)
    .catch([{ name: 'You', xp: 0, updatedAt: new Date(0).toISOString() }]),
  perfectQuizIds: z.array(z.string()).catch([]),
  lessonXpAwardedDays: z.array(z.number()).catch([]),
  completedExerciseIds: z.array(z.string()).catch([]),
  lessonsCompletedByDate: z.record(z.string(), z.number()).catch({}),
})

type GamificationStore = {
  xpTotal: number
  xpByDay: Record<number, number>
  achievementsUnlocked: string[]
  dailyChallenge: DailyChallenge
  leaderboard: LeaderboardEntry[]
  perfectQuizIds: string[]
  lessonXpAwardedDays: number[]
  completedExerciseIds: string[]
  lessonsCompletedByDate: Record<string, number>
  hasHydrated: boolean
  hydrate: () => void
  awardLessonCompletion: (day: number, completedAt?: Date) => void
  awardExerciseCompletion: (day: number, exerciseId: string) => void
  awardPerfectQuiz: (quizId: string) => void
  refreshDailyChallenge: () => void
  xpToNextMilestone: () => { current: number; next: number | null; percent: number }
  getAchievementMeta: (id: string) => AchievementMeta | null
}

function toDayKey(input: Date): string {
  const year = input.getFullYear()
  const month = `${input.getMonth() + 1}`.padStart(2, '0')
  const day = `${input.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function randomFrom<T>(items: T[]): T | null {
  if (!items.length) return null
  const array = new Uint32Array(1)
  // Ensure array[0] is defined, fallback to 0 if something is wrong
  crypto.getRandomValues(array)
  const index = (array[0] || 0) % items.length
  return items[index] ?? null
}

function resolveChallengeCandidates(): number[] {
  const progress = useProgressStore.getState()
  const completed = progress.completedLessons
  if (completed.length) return completed

  const lastVisited = progress.lastVisitedLesson
  if (lastVisited && lastVisited > 0) {
    return Array.from({ length: lastVisited }, (_, i) => i + 1)
  }

  return getAllPhases().flatMap((phase) => {
    const lessons = getLessonsByPhase(phase.phase)
    const validDays: number[] = []
    for (const lesson of lessons) {
      const day = dayTokenToProgressId(lesson.day)
      if (Number.isInteger(day) && day > 0) {
        validDays.push(day)
      }
    }
    return validDays
  })
}

function maybeCelebrateAchievement(id: AchievementId): void {
  const meta = ACHIEVEMENTS.find((item) => item.id === id)
  if (!meta) return

  triggerSparkle()
  toastSuccess(`${meta.icon} Badge unlocked: ${meta.label}`)
}

/**
 * Hook for accessing the gamification store state.
 *
 * @returns {GamificationStore} The state of the gamification store.
 */
export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      xpTotal: 0,
      xpByDay: {},
      achievementsUnlocked: [],
      dailyChallenge: { day: 1, dateKey: '' },
      leaderboard: [{ name: 'You', xp: 0, updatedAt: new Date(0).toISOString() }],
      perfectQuizIds: [],
      lessonXpAwardedDays: [],
      completedExerciseIds: [],
      lessonsCompletedByDate: {},
      hasHydrated: false,
      hydrate: () => {
        if (get().hasHydrated) return
        useGamificationStore.persist.rehydrate()
      },
      awardLessonCompletion: (day, completedAt = new Date()) => {
        if (!Number.isInteger(day) || day < 1) return

        set((state) => {
          if (state.lessonXpAwardedDays.includes(day)) return state

          const nextXpTotal = state.xpTotal + 10
          const nextXpByDay = { ...state.xpByDay, [day]: (state.xpByDay[day] ?? 0) + 10 }
          const dateKey = toDayKey(completedAt)
          const nextLessonsByDate = {
            ...state.lessonsCompletedByDate,
            [dateKey]: (state.lessonsCompletedByDate[dateKey] ?? 0) + 1,
          }
          const unlocked = new Set(state.achievementsUnlocked as AchievementId[])

          if (useProgressStore.getState().completedLessonsCount() >= 1) unlocked.add('first-lesson')
          if (useProgressStore.getState().streakDays(completedAt) >= 7) unlocked.add('streak-7')
          if (completedAt.getHours() >= 22) unlocked.add('night-owl')
          if ((nextLessonsByDate[dateKey] ?? 0) >= 3) unlocked.add('speed-runner')
          if (nextXpTotal >= 50) unlocked.add('xp-50')
          if (nextXpTotal >= 150) unlocked.add('xp-150')
          if (nextXpTotal >= 300) unlocked.add('xp-300')

          const previous = new Set(state.achievementsUnlocked as AchievementId[])
          for (const id of unlocked) {
            if (!previous.has(id)) maybeCelebrateAchievement(id)
          }

          return {
            xpTotal: nextXpTotal,
            xpByDay: nextXpByDay,
            lessonsCompletedByDate: nextLessonsByDate,
            achievementsUnlocked: [...unlocked],
            leaderboard: [{ name: 'You', xp: nextXpTotal, updatedAt: new Date().toISOString() }],
            lessonXpAwardedDays: [...state.lessonXpAwardedDays, day],
          }
        })
      },
      awardExerciseCompletion: (day, exerciseId) => {
        if (!Number.isInteger(day) || day < 1 || !exerciseId.trim()) return

        set((state) => {
          if (state.completedExerciseIds.includes(exerciseId)) return state
          const nextXpTotal = state.xpTotal + 5
          const unlocked = new Set(state.achievementsUnlocked as AchievementId[])
          if (nextXpTotal >= 50) unlocked.add('xp-50')
          if (nextXpTotal >= 150) unlocked.add('xp-150')
          if (nextXpTotal >= 300) unlocked.add('xp-300')

          const previous = new Set(state.achievementsUnlocked as AchievementId[])
          for (const id of unlocked) {
            if (!previous.has(id)) maybeCelebrateAchievement(id)
          }

          return {
            xpTotal: nextXpTotal,
            xpByDay: { ...state.xpByDay, [day]: (state.xpByDay[day] ?? 0) + 5 },
            completedExerciseIds: [...state.completedExerciseIds, exerciseId],
            achievementsUnlocked: [...unlocked],
            leaderboard: [{ name: 'You', xp: nextXpTotal, updatedAt: new Date().toISOString() }],
          }
        })
      },
      awardPerfectQuiz: (quizId) => {
        if (!quizId.trim()) return

        set((state) => {
          if (state.perfectQuizIds.includes(quizId)) return state
          const nextPerfect = [...state.perfectQuizIds, quizId]
          const nextXpTotal = state.xpTotal + 20
          const unlocked = new Set(state.achievementsUnlocked as AchievementId[])
          if (nextPerfect.length >= 3) unlocked.add('quiz-master')
          if (nextXpTotal >= 50) unlocked.add('xp-50')
          if (nextXpTotal >= 150) unlocked.add('xp-150')
          if (nextXpTotal >= 300) unlocked.add('xp-300')

          const previous = new Set(state.achievementsUnlocked as AchievementId[])
          for (const id of unlocked) {
            if (!previous.has(id)) maybeCelebrateAchievement(id)
          }

          return {
            perfectQuizIds: nextPerfect,
            xpTotal: nextXpTotal,
            achievementsUnlocked: [...unlocked],
            leaderboard: [{ name: 'You', xp: nextXpTotal, updatedAt: new Date().toISOString() }],
          }
        })
      },
      refreshDailyChallenge: () => {
        const todayKey = toDayKey(new Date())
        const existing = get().dailyChallenge
        if (existing.dateKey === todayKey) return

        const candidates = resolveChallengeCandidates()
        const picked = randomFrom(candidates)
        if (!picked) return

        set({ dailyChallenge: { day: picked, dateKey: todayKey } })
      },
      xpToNextMilestone: () => {
        const current = get().xpTotal
        const next = XP_MILESTONES.find((value) => value > current) ?? null
        if (!next) return { current, next: null, percent: 100 }

        const previous = [...XP_MILESTONES].reverse().find((value) => value <= current) ?? 0
        const percent = Math.max(
          0,
          Math.min(100, Math.round(((current - previous) / (next - previous)) * 100)),
        )

        return { current, next, percent }
      },
      getAchievementMeta: (id) => ACHIEVEMENTS.find((item) => item.id === id) ?? null,
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        xpTotal: state.xpTotal,
        xpByDay: state.xpByDay,
        achievementsUnlocked: state.achievementsUnlocked,
        dailyChallenge: state.dailyChallenge,
        leaderboard: state.leaderboard,
        perfectQuizIds: state.perfectQuizIds,
        lessonXpAwardedDays: state.lessonXpAwardedDays,
        completedExerciseIds: state.completedExerciseIds,
        lessonsCompletedByDate: state.lessonsCompletedByDate,
      }),
      migrate: (persistedState) => {
        const parsed = PersistedGamificationSchema.safeParse(persistedState || {})
        if (parsed.success) {
          return parsed.data
        }
        return {
          xpTotal: 0,
          xpByDay: {},
          achievementsUnlocked: [],
          dailyChallenge: { day: 1, dateKey: '' },
          leaderboard: [{ name: 'You', xp: 0, updatedAt: new Date(0).toISOString() }],
          perfectQuizIds: [],
          lessonXpAwardedDays: [],
          completedExerciseIds: [],
          lessonsCompletedByDate: {},
        }
      },
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (!state) return
        useGamificationStore.setState({ hasHydrated: true })
        useGamificationStore.getState().refreshDailyChallenge()
      },
    },
  ),
)

/**
 * Hydrates the gamification store from persistent storage.
 * @returns {void}
 */
export function hydrateGamificationStore(): void {
  useGamificationStore.getState().hydrate()
}
