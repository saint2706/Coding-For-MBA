/**
 * Mastery Store
 *
 * Tracks per-question self-assessment ("got it" / "review again") for
 * Mastery Check questions embedded in lessons, persisted to localStorage.
 *
 * Key Responsibilities:
 * - Record self-assessed status per lesson/question.
 * - Aggregate mastery stats per lesson (e.g. "3/5 mastered").
 * - Surface lessons with outstanding "review again" questions for a
 *   lightweight spaced-repetition nudge.
 */

import { create } from 'zustand'
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware'
import { z } from 'zod'
import { normalizeDayToken } from '../utils/dayToken'

const STORAGE_KEY = 'coding-for-mba-mastery'
const KEY_SEPARATOR = '::'

export type MasteryStatus = 'got-it' | 'review-again'

export interface LessonMasteryStats {
  gotIt: number
  reviewAgain: number
  total: number
}

export interface LessonNeedingReview {
  lessonId: string
  reviewCount: number
}

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

const PersistedMasterySchema = z.object({
  questionStatus: z.record(z.string(), z.enum(['got-it', 'review-again'])).catch({}),
})

type MasteryStore = {
  questionStatus: Record<string, MasteryStatus>
  hasHydrated: boolean
  hydrate: () => void
  setQuestionStatus: (
    lessonId: string | number,
    questionNumber: number,
    status: MasteryStatus,
  ) => void
  getQuestionStatus: (lessonId: string | number, questionNumber: number) => MasteryStatus | null
  getLessonStats: (lessonId: string | number, totalQuestions: number) => LessonMasteryStats
  getLessonsNeedingReview: () => LessonNeedingReview[]
  clearAllMastery: () => void
}

function questionKey(lessonId: string | number, questionNumber: number): string {
  return `${normalizeDayToken(lessonId)}${KEY_SEPARATOR}${questionNumber}`
}

/**
 * Hook for accessing the mastery store state.
 *
 * @returns {MasteryStore} The state of the mastery store.
 */
export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      questionStatus: {},
      hasHydrated: false,
      hydrate: () => {
        if (get().hasHydrated) return
        useMasteryStore.persist.rehydrate()
      },
      setQuestionStatus: (lessonId, questionNumber, status) => {
        set((state) => ({
          questionStatus: { ...state.questionStatus, [questionKey(lessonId, questionNumber)]: status },
        }))
      },
      getQuestionStatus: (lessonId, questionNumber) =>
        get().questionStatus[questionKey(lessonId, questionNumber)] ?? null,
      getLessonStats: (lessonId, totalQuestions) => {
        const prefix = `${normalizeDayToken(lessonId)}${KEY_SEPARATOR}`
        const statuses = get().questionStatus
        let gotIt = 0
        let reviewAgain = 0
        for (const [key, status] of Object.entries(statuses)) {
          if (!key.startsWith(prefix)) continue
          if (status === 'got-it') gotIt++
          else if (status === 'review-again') reviewAgain++
        }
        return { gotIt, reviewAgain, total: totalQuestions }
      },
      getLessonsNeedingReview: () => {
        const counts = new Map<string, number>()
        for (const [key, status] of Object.entries(get().questionStatus)) {
          if (status !== 'review-again') continue
          const lessonId = key.split(KEY_SEPARATOR)[0]
          if (!lessonId) continue
          counts.set(lessonId, (counts.get(lessonId) ?? 0) + 1)
        }
        return [...counts.entries()]
          .map(([lessonId, reviewCount]) => ({ lessonId, reviewCount }))
          .sort((a, b) => b.reviewCount - a.reviewCount)
      },
      clearAllMastery: () => set({ questionStatus: {} }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ questionStatus: state.questionStatus }),
      migrate: (persistedState) => {
        const parsed = PersistedMasterySchema.safeParse(persistedState || {})
        return parsed.success ? parsed.data : { questionStatus: {} }
      },
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (!state) return
        useMasteryStore.setState({ hasHydrated: true })
      },
    },
  ),
)

/**
 * Hydrates the mastery store from persistent storage.
 * @returns {void}
 */
export function hydrateMasteryStore(): void {
  useMasteryStore.getState().hydrate()
}
