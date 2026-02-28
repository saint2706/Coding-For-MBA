/**
 * AI Study Assistant Store
 *
 * Zustand store managing the AI chat panel state, message history,
 * flashcards, and hint levels. Persisted to localStorage.
 *
 * @module stores/aiAssistantStore
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, Flashcard } from '../utils/geminiClient'

const MAX_MESSAGES_PER_DAY = 100
const MAX_FLASHCARDS_PER_DAY = 50
const MAX_DAYS_RETAINED = 30

type DayBuckets<T> = Record<string, T[]>

function pruneDayBuckets<T>(
  buckets: DayBuckets<T>,
  maxItemsPerDay: number,
  maxDaysRetained: number,
): DayBuckets<T> {
  const retainedDays = Object.keys(buckets)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, maxDaysRetained)

  return retainedDays.reduce<DayBuckets<T>>((acc, day) => {
    const dayItems = buckets[day] || []
    acc[day] = dayItems.slice(-maxItemsPerDay)
    return acc
  }, {})
}

function prunePersistedState(state: Pick<AiAssistantState, 'messagesByDay' | 'flashcardsByDay'>) {
  return {
    messagesByDay: pruneDayBuckets(
      state.messagesByDay,
      MAX_MESSAGES_PER_DAY,
      MAX_DAYS_RETAINED,
    ),
    flashcardsByDay: pruneDayBuckets(
      state.flashcardsByDay,
      MAX_FLASHCARDS_PER_DAY,
      MAX_DAYS_RETAINED,
    ),
  }
}

interface AiAssistantState {
    isOpen: boolean
    isLoading: boolean
    activeTab: 'chat' | 'flashcards'
    messagesByDay: Record<string, ChatMessage[]>
    flashcardsByDay: Record<string, Flashcard[]>
    hintLevelsByExercise: Record<string, number>

    toggle: () => void
    open: () => void
    close: () => void
    setLoading: (loading: boolean) => void
    setActiveTab: (tab: 'chat' | 'flashcards') => void
    addMessage: (day: string, message: ChatMessage) => void
    clearMessages: (day: string) => void
    setFlashcards: (day: string, cards: Flashcard[]) => void
    getHintLevel: (exerciseId: string) => number
    incrementHintLevel: (exerciseId: string) => number
    resetHintLevel: (exerciseId: string) => void
}

export const useAiAssistantStore = create<AiAssistantState>()(
    persist(
        (set, get) => ({
            isOpen: false,
            isLoading: false,
            activeTab: 'chat',
            messagesByDay: {},
            flashcardsByDay: {},
            hintLevelsByExercise: {},

            toggle: () => set((s) => ({ isOpen: !s.isOpen })),
            open: () => set({ isOpen: true }),
            close: () => set({ isOpen: false }),
            setLoading: (loading) => set({ isLoading: loading }),
            setActiveTab: (tab) => set({ activeTab: tab }),

            addMessage: (day, message) =>
                set((s) => {
                    const nextMessagesByDay = {
                        ...s.messagesByDay,
                        [day]: [...(s.messagesByDay[day] || []), message],
                    }

                    return {
                        messagesByDay: pruneDayBuckets(
                            nextMessagesByDay,
                            MAX_MESSAGES_PER_DAY,
                            MAX_DAYS_RETAINED,
                        ),
                    }
                }),

            clearMessages: (day) =>
                set((s) => ({
                    messagesByDay: { ...s.messagesByDay, [day]: [] },
                })),

            setFlashcards: (day, cards) =>
                set((s) => {
                    const nextFlashcardsByDay = { ...s.flashcardsByDay, [day]: cards }
                    return {
                        flashcardsByDay: pruneDayBuckets(
                            nextFlashcardsByDay,
                            MAX_FLASHCARDS_PER_DAY,
                            MAX_DAYS_RETAINED,
                        ),
                    }
                }),

            getHintLevel: (exerciseId) => get().hintLevelsByExercise[exerciseId] || 0,

            incrementHintLevel: (exerciseId) => {
                const current = get().hintLevelsByExercise[exerciseId] || 0
                const next = Math.min(current + 1, 3)
                set((s) => ({
                    hintLevelsByExercise: { ...s.hintLevelsByExercise, [exerciseId]: next },
                }))
                return next
            },

            resetHintLevel: (exerciseId) =>
                set((s) => ({
                    hintLevelsByExercise: { ...s.hintLevelsByExercise, [exerciseId]: 0 },
                })),
        }),
        {
            name: 'ai-assistant-store',
            version: 1,
            migrate: (persistedState) => {
                const raw = (persistedState || {}) as Partial<AiAssistantState>
                const pruned = prunePersistedState({
                    messagesByDay: raw.messagesByDay || {},
                    flashcardsByDay: raw.flashcardsByDay || {},
                })

                return {
                    ...raw,
                    ...pruned,
                    hintLevelsByExercise: raw.hintLevelsByExercise || {},
                }
            },
            partialize: (state) => ({
                ...prunePersistedState(state),
                hintLevelsByExercise: state.hintLevelsByExercise,
            }),
        },
    ),
)
