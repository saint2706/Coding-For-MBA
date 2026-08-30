import { create } from 'zustand'
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware'

export type NoteEntry = {
  content: string
  updatedAt: number
}

type NotesStore = {
  notes: Record<string, NoteEntry>
  setNote: (day: string, content: string) => void
  deleteNote: (day: string) => void
  clearAllNotes: () => void
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
      // Ignore storage write failures (private mode, quota, etc.)
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(name)
    } catch {
      // Ignore storage delete failures.
    }
  },
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: {},
      setNote: (day, content) =>
        set((state) => ({
          notes: {
            ...state.notes,
            [day]: { content, updatedAt: Date.now() },
          },
        })),
      deleteNote: (day) =>
        set((state) => {
          const next = { ...state.notes }
          delete next[day]
          return { notes: next }
        }),
      clearAllNotes: () => set({ notes: {} }),
    }),
    {
      name: 'coding-for-mba-notes',
      storage: createJSONStorage(() => safeStorage),
    },
  ),
)
