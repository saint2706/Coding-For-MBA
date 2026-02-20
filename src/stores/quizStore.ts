/**
 * Quiz Store
 *
 * Manages the state and history of mastery checks and quizzes.
 *
 * Key Responsibilities:
 * - Record quiz attempts with results (correct/incorrect, output).
 * - Compute statistics (accuracy, attempt counts) for each topic.
 * - Identify "most missed" questions and low-scoring topics for review.
 * - Persist quiz history to localStorage.
 */

import { create } from 'zustand'
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware'

type QuizAttempt = {
  id: string
  quizId: string
  topic: string
  attemptedAt: string
  correct: boolean
  output?: string
  error?: string
}

type QuizStats = {
  quizId: string
  topic: string
  attempts: number
  correct: number
  incorrect: number
  accuracy: number
  lastAttemptAt: string
}

type QuizStore = {
  attempts: QuizAttempt[]
  hasHydrated: boolean
  hydrate: () => void
  recordAttempt: (attempt: Omit<QuizAttempt, 'id' | 'attemptedAt'> & { attemptedAt?: Date }) => void
  getQuizStats: (quizId: string) => QuizStats | null
  getMostMissedQuestions: (limit?: number) => QuizStats[]
  getLowScoringTopics: (threshold?: number, minAttempts?: number) => QuizStats[]
  getRecentAttempts: (quizId: string, limit?: number) => QuizAttempt[]
  clearQuizHistory: () => void
}

const STORAGE_KEY = 'coding-for-mba-quiz-state'
const MAX_ATTEMPTS = 500

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
      // Ignore localStorage failures (private mode, quota, etc.)
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(name)
    } catch {
      // Ignore localStorage failures.
    }
  },
}

function asIsoString(value?: Date): string {
  return (value ?? new Date()).toISOString()
}

function createAttemptId(quizId: string, attemptedAt: string): string {
  return `${quizId}:${attemptedAt}:${Math.random().toString(36).slice(2, 8)}`
}

function computeStats(attempts: QuizAttempt[], quizId: string): QuizStats | null {
  const records = attempts.filter((attempt) => attempt.quizId === quizId)
  if (!records.length) return null

  const attemptsCount = records.length
  const correct = records.filter((attempt) => attempt.correct).length
  const incorrect = attemptsCount - correct
  const topic = records[records.length - 1]?.topic ?? quizId
  const lastAttemptAt = records[records.length - 1]?.attemptedAt ?? new Date(0).toISOString()

  return {
    quizId,
    topic,
    attempts: attemptsCount,
    correct,
    incorrect,
    accuracy: attemptsCount > 0 ? Math.round((correct / attemptsCount) * 100) : 0,
    lastAttemptAt,
  }
}

function normalizeAttempts(value: unknown): QuizAttempt[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is QuizAttempt => {
      if (!item || typeof item !== 'object') return false
      const maybe = item as Partial<QuizAttempt>
      return (
        typeof maybe.id === 'string' &&
        typeof maybe.quizId === 'string' &&
        typeof maybe.topic === 'string' &&
        typeof maybe.attemptedAt === 'string' &&
        typeof maybe.correct === 'boolean'
      )
    })
    .slice(-MAX_ATTEMPTS)
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      attempts: [],
      hasHydrated: false,
      hydrate: () => {
        if (get().hasHydrated) return
        useQuizStore.persist.rehydrate()
      },
      recordAttempt: ({ quizId, topic, correct, output, error, attemptedAt }) => {
        if (!quizId.trim() || !topic.trim()) return

        const attemptedAtIso = asIsoString(attemptedAt)
        set((state) => ({
          attempts: [
            ...state.attempts,
            {
              id: createAttemptId(quizId, attemptedAtIso),
              quizId,
              topic,
              attemptedAt: attemptedAtIso,
              correct,
              ...(output ? { output } : {}),
              ...(error ? { error } : {}),
            },
          ].slice(-MAX_ATTEMPTS),
        }))
      },
      getQuizStats: (quizId) => computeStats(get().attempts, quizId),
      getMostMissedQuestions: (limit = 5) => {
        const grouped = new Set(get().attempts.map((attempt) => attempt.quizId))
        return [...grouped]
          .map((quizId) => get().getQuizStats(quizId))
          .filter((stats): stats is QuizStats => Boolean(stats))
          .sort((a, b) => b.incorrect - a.incorrect || a.accuracy - b.accuracy)
          .slice(0, limit)
      },
      getLowScoringTopics: (threshold = 60, minAttempts = 2) => {
        const grouped = new Set(get().attempts.map((attempt) => attempt.quizId))
        return [...grouped]
          .map((quizId) => get().getQuizStats(quizId))
          .filter((stats): stats is QuizStats => Boolean(stats))
          .filter((stats) => stats.attempts >= minAttempts && stats.accuracy < threshold)
          .sort((a, b) => a.accuracy - b.accuracy || b.incorrect - a.incorrect)
      },
      getRecentAttempts: (quizId, limit = 5) =>
        get()
          .attempts.filter((attempt) => attempt.quizId === quizId)
          .slice(-limit)
          .reverse(),
      clearQuizHistory: () => {
        set({ attempts: [] })
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ attempts: state.attempts }),
      migrate: (persistedState) => {
        const raw = (persistedState || {}) as { attempts?: unknown }
        return {
          attempts: normalizeAttempts(raw.attempts),
        }
      },
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useQuizStore.setState({ hasHydrated: true })
      },
    },
  ),
)

export function hydrateQuizStore(): void {
  useQuizStore.getState().hydrate()
}
