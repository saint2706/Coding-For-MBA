import { useAiAssistantStore } from '../aiAssistantStore'
import type { ChatMessage, Flashcard } from '../../utils/geminiClient'

const STORAGE_KEY = 'ai-assistant-store'

function makeMessage(index: number): ChatMessage {
  return {
    id: `msg-${index}`,
    role: index % 2 === 0 ? 'user' : 'model',
    text: `message-${index}`,
  }
}

function makeFlashcard(index: number): Flashcard {
  return {
    id: `card-${index}`,
    front: `front-${index}`,
    back: `back-${index}`,
  }
}

describe('aiAssistantStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useAiAssistantStore.setState({
      isOpen: false,
      isLoading: false,
      activeTab: 'chat',
      messagesByDay: {},
      flashcardsByDay: {},
      hintLevelsByExercise: {},
    })
  })

  it('prunes messages to max per day and max days during addMessage', () => {
    const store = useAiAssistantStore.getState()

    for (let day = 1; day <= 35; day += 1) {
      const dayKey = `2026-01-${String(day).padStart(2, '0')}`
      for (let i = 0; i < 105; i += 1) {
        store.addMessage(dayKey, makeMessage(i))
      }
    }

    const state = useAiAssistantStore.getState()

    expect(Object.keys(state.messagesByDay)).toHaveLength(30)
    expect(state.messagesByDay['2026-01-01']).toBeUndefined()
    expect(state.messagesByDay['2026-01-06']).toBeDefined()
    expect(state.messagesByDay['2026-01-35']).toBeDefined()

    const latestDayMessages = state.messagesByDay['2026-01-35']
    expect(latestDayMessages).toBeDefined()
    expect(latestDayMessages!).toHaveLength(100)
    expect(latestDayMessages?.[0]?.text).toBe('message-5')
    expect(latestDayMessages?.[99]?.text).toBe('message-104')
  })

  it('prunes flashcards to max per day and max days during setFlashcards', () => {
    const store = useAiAssistantStore.getState()

    for (let day = 1; day <= 33; day += 1) {
      const dayKey = `2026-02-${String(day).padStart(2, '0')}`
      const cards = Array.from({ length: 60 }, (_, i) => makeFlashcard(i))
      store.setFlashcards(dayKey, cards)
    }

    const state = useAiAssistantStore.getState()

    expect(Object.keys(state.flashcardsByDay)).toHaveLength(30)
    expect(state.flashcardsByDay['2026-02-01']).toBeUndefined()

    const latestDayCards = state.flashcardsByDay['2026-02-33']
    expect(latestDayCards).toBeDefined()
    expect(latestDayCards!).toHaveLength(50)
    expect(latestDayCards?.[0]?.front).toBe('front-10')
    expect(latestDayCards?.[49]?.front).toBe('front-59')
  })

  it('persists pruned state and migrates oversized existing storage', async () => {
    const oversizedMessages = Array.from({ length: 130 }, (_, i) => makeMessage(i))
    const oversizedFlashcards = Array.from({ length: 80 }, (_, i) => makeFlashcard(i))

    const oldState = {
      state: {
        messagesByDay: {
          '2025-12-01': oversizedMessages,
          '2025-12-02': oversizedMessages,
          '2025-12-03': oversizedMessages,
          '2025-12-04': oversizedMessages,
          '2025-12-05': oversizedMessages,
          '2025-12-06': oversizedMessages,
          '2025-12-07': oversizedMessages,
          '2025-12-08': oversizedMessages,
          '2025-12-09': oversizedMessages,
          '2025-12-10': oversizedMessages,
          '2025-12-11': oversizedMessages,
          '2025-12-12': oversizedMessages,
          '2025-12-13': oversizedMessages,
          '2025-12-14': oversizedMessages,
          '2025-12-15': oversizedMessages,
          '2025-12-16': oversizedMessages,
          '2025-12-17': oversizedMessages,
          '2025-12-18': oversizedMessages,
          '2025-12-19': oversizedMessages,
          '2025-12-20': oversizedMessages,
          '2025-12-21': oversizedMessages,
          '2025-12-22': oversizedMessages,
          '2025-12-23': oversizedMessages,
          '2025-12-24': oversizedMessages,
          '2025-12-25': oversizedMessages,
          '2025-12-26': oversizedMessages,
          '2025-12-27': oversizedMessages,
          '2025-12-28': oversizedMessages,
          '2025-12-29': oversizedMessages,
          '2025-12-30': oversizedMessages,
          '2025-12-31': oversizedMessages,
        },
        flashcardsByDay: {
          '2025-12-31': oversizedFlashcards,
        },
        hintLevelsByExercise: { ex1: 2 },
      },
      version: 0,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(oldState))

    await useAiAssistantStore.persist.rehydrate()

    const state = useAiAssistantStore.getState()

    expect(Object.keys(state.messagesByDay)).toHaveLength(30)
    expect(state.messagesByDay['2025-12-01']).toBeUndefined()
    expect(state.messagesByDay['2025-12-31']).toBeDefined()
    expect(state.messagesByDay['2025-12-31']!).toHaveLength(100)
    expect(state.messagesByDay['2025-12-31']?.[0]?.text).toBe('message-30')
    expect(state.messagesByDay['2025-12-31']?.[0]?.id).toBe('msg-30')

    expect(state.flashcardsByDay['2025-12-31']).toBeDefined()
    expect(state.flashcardsByDay['2025-12-31']!).toHaveLength(50)
    expect(state.flashcardsByDay['2025-12-31']?.[0]?.front).toBe('front-30')
    expect(state.flashcardsByDay['2025-12-31']?.[0]?.id).toBe('card-30')
    expect(state.hintLevelsByExercise.ex1).toBe(2)

    const rawPersisted = window.localStorage.getItem(STORAGE_KEY)
    expect(rawPersisted).toBeTruthy()

    const persisted = JSON.parse(rawPersisted as string) as {
      state: {
        messagesByDay: Record<string, ChatMessage[]>
        flashcardsByDay: Record<string, Flashcard[]>
      }
      version: number
    }

    expect(Object.keys(persisted.state.messagesByDay)).toHaveLength(30)
    expect(persisted.state.messagesByDay['2025-12-31']).toHaveLength(100)
    expect(persisted.state.flashcardsByDay['2025-12-31']).toHaveLength(50)
    expect(persisted.version).toBe(1)
  })

  it('assigns stable IDs to new messages and generated flashcards', () => {
    const store = useAiAssistantStore.getState()

    store.addMessage('2026-03-01', { role: 'user', text: 'no-id-message' })
    store.setFlashcards('2026-03-01', [{ front: 'Q', back: 'A' }])

    const state = useAiAssistantStore.getState()

    expect(state.messagesByDay['2026-03-01']?.[0]?.id).toMatch(/^msg-/)
    expect(state.flashcardsByDay['2026-03-01']?.[0]?.id).toMatch(/^card-/)
  })

  it('keeps IDs stable when clearing chat, regenerating flashcards, and reordering cards', () => {
    const store = useAiAssistantStore.getState()

    store.addMessage('2026-03-02', makeMessage(1))
    store.addMessage('2026-03-02', makeMessage(2))
    store.clearMessages('2026-03-02')
    store.addMessage('2026-03-02', makeMessage(3))

    const regeneratedCards = [makeFlashcard(100), makeFlashcard(101), makeFlashcard(102)]
    store.setFlashcards('2026-03-02', regeneratedCards)
    store.setFlashcards('2026-03-02', [...regeneratedCards].reverse())

    const state = useAiAssistantStore.getState()
    const chatIds = (state.messagesByDay['2026-03-02'] || []).map((msg) => msg.id)
    const flashcardIds = (state.flashcardsByDay['2026-03-02'] || []).map((card) => card.id)

    expect(chatIds).toEqual(['msg-3'])
    expect(flashcardIds).toEqual(['card-102', 'card-101', 'card-100'])
  })
})
