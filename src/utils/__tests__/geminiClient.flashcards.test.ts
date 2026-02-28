import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadGeminiClient() {
  vi.resetModules()
  return import('../geminiClient')
}

function mockGenerateResponse(text: string): Response {
  return {
    ok: true,
    json: async () => ({ text }),
  } as Response
}

describe('generateFlashcards schema validation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('returns a retry-friendly error for malformed JSON', async () => {
    vi.stubEnv('VITE_GEMINI_API_BASE', 'https://api.example.com')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockGenerateResponse('not json'))

    const geminiClient = await loadGeminiClient()

    await expect(geminiClient.generateFlashcards('Lesson body')).rejects.toThrow(
      'We could not generate valid flashcards this time. Please try again.',
    )
  })

  it('returns a retry-friendly error when flashcard count is not exactly 8', async () => {
    vi.stubEnv('VITE_GEMINI_API_BASE', 'https://api.example.com')
    const sevenCards = Array.from({ length: 7 }, (_, index) => ({
      front: `Question ${index + 1}`,
      back: `Answer ${index + 1}`,
    }))

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockGenerateResponse(JSON.stringify(sevenCards)),
    )

    const geminiClient = await loadGeminiClient()

    await expect(geminiClient.generateFlashcards('Lesson body')).rejects.toThrow(
      'We could not generate valid flashcards this time. Please try again.',
    )
  })

  it('returns a retry-friendly error when card fields are invalid', async () => {
    vi.stubEnv('VITE_GEMINI_API_BASE', 'https://api.example.com')
    const cardsWithInvalidField = Array.from({ length: 8 }, (_, index) => ({
      front: `Question ${index + 1}`,
      back: `Answer ${index + 1}`,
    }))
    cardsWithInvalidField[3] = { front: '   ', back: 'Valid answer' }

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockGenerateResponse(JSON.stringify(cardsWithInvalidField)),
    )

    const geminiClient = await loadGeminiClient()

    await expect(geminiClient.generateFlashcards('Lesson body')).rejects.toThrow(
      'We could not generate valid flashcards this time. Please try again.',
    )
  })
})
