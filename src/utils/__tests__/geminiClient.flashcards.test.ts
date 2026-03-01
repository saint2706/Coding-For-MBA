import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateFlashcards } from '../geminiClient'

const mockSendMessage = vi.fn()

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        startChat: () => ({ sendMessage: mockSendMessage }),
        embedContent: vi.fn(),
      }
    }
  },
}))

describe('generateFlashcards schema validation', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    mockSendMessage.mockReset()
  })

  it('returns a retry-friendly error for malformed JSON', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key')
    mockSendMessage.mockResolvedValue({ response: { text: () => 'not json' } })

    await expect(generateFlashcards('Lesson body')).rejects.toThrow(
      'We could not generate valid flashcards this time. Please try again.',
    )
  })

  it('returns a retry-friendly error when flashcard count is not exactly 8', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key')
    const sevenCards = Array.from({ length: 7 }, (_, index) => ({
      front: `Question ${index + 1}`,
      back: `Answer ${index + 1}`,
    }))
    mockSendMessage.mockResolvedValue({
      response: { text: () => JSON.stringify(sevenCards) },
    })

    await expect(generateFlashcards('Lesson body')).rejects.toThrow(
      'We could not generate valid flashcards this time. Please try again.',
    )
  })

  it('returns a retry-friendly error when card fields are invalid', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key')
    const cardsWithInvalidField = Array.from({ length: 8 }, (_, index) => ({
      front: `Question ${index + 1}`,
      back: `Answer ${index + 1}`,
    }))
    cardsWithInvalidField[3] = { front: '   ', back: 'Valid answer' }
    mockSendMessage.mockResolvedValue({
      response: { text: () => JSON.stringify(cardsWithInvalidField) },
    })

    await expect(generateFlashcards('Lesson body')).rejects.toThrow(
      'We could not generate valid flashcards this time. Please try again.',
    )
  })
})
