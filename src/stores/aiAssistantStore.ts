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
                set((s) => ({
                    messagesByDay: {
                        ...s.messagesByDay,
                        [day]: [...(s.messagesByDay[day] || []), message],
                    },
                })),

            clearMessages: (day) =>
                set((s) => ({
                    messagesByDay: { ...s.messagesByDay, [day]: [] },
                })),

            setFlashcards: (day, cards) =>
                set((s) => ({
                    flashcardsByDay: { ...s.flashcardsByDay, [day]: cards },
                })),

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
            partialize: (state) => ({
                messagesByDay: state.messagesByDay,
                flashcardsByDay: state.flashcardsByDay,
                hintLevelsByExercise: state.hintLevelsByExercise,
            }),
        },
    ),
)
