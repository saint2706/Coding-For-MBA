import { afterEach, describe, expect, it, vi } from 'vitest'
import { askAboutLesson, embedText } from '../geminiClient'

const mockSendMessage = vi.fn()
const mockEmbedContent = vi.fn()

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        startChat: () => ({ sendMessage: mockSendMessage }),
        embedContent: mockEmbedContent,
      }
    }
  },
}))

function sdkError(status: number): Error {
  const err = new Error(`HTTP ${status}`) as Error & { status: number }
  err.status = status
  return err
}

describe('geminiClient error classification', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    mockSendMessage.mockReset()
    mockEmbedContent.mockReset()
  })

  it('throws apiKeyInvalid when no API key is configured', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '')

    await expect(askAboutLesson('content', 'question')).rejects.toThrow(
      'Invalid API key. Get a free key at aistudio.google.com and set it as VITE_GEMINI_API_KEY.',
    )
  })

  it('throws apiKeyInvalid on 403 from the SDK', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'bad-key')
    mockSendMessage.mockRejectedValue(sdkError(403))

    await expect(askAboutLesson('content', 'question')).rejects.toThrow(
      'Invalid API key. Get a free key at aistudio.google.com and set it as VITE_GEMINI_API_KEY.',
    )
  })

  it('throws apiKeyInvalid on 401 from the SDK', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'bad-key')
    mockSendMessage.mockRejectedValue(sdkError(401))

    await expect(askAboutLesson('content', 'question')).rejects.toThrow(
      'Invalid API key. Get a free key at aistudio.google.com and set it as VITE_GEMINI_API_KEY.',
    )
  })

  it('throws apiKeyInvalid on 400 from the SDK', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'bad-key')
    mockSendMessage.mockRejectedValue(sdkError(400))

    await expect(askAboutLesson('content', 'question')).rejects.toThrow(
      'Invalid API key. Get a free key at aistudio.google.com and set it as VITE_GEMINI_API_KEY.',
    )
  })

  it('throws rateLimit on 429 from the SDK', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key')
    mockSendMessage.mockRejectedValue(sdkError(429))

    await expect(askAboutLesson('content', 'question')).rejects.toThrow(
      'Rate limit reached. Please wait a moment and try again.',
    )
  })

  it('throws serverUnavailable for generic network errors', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key')
    mockSendMessage.mockRejectedValue(new Error('Network error'))

    await expect(askAboutLesson('content', 'question')).rejects.toThrow(
      'Server unavailable. Please try again shortly.',
    )
  })

  it('throws apiKeyInvalid in embedText when no API key is configured', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '')

    await expect(embedText('some text')).rejects.toThrow(
      'Invalid API key. Get a free key at aistudio.google.com and set it as VITE_GEMINI_API_KEY.',
    )
  })

  it('throws apiKeyInvalid in embedText on 403 from the SDK', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'bad-key')
    mockEmbedContent.mockRejectedValue(sdkError(403))

    await expect(embedText('some text')).rejects.toThrow(
      'Invalid API key. Get a free key at aistudio.google.com and set it as VITE_GEMINI_API_KEY.',
    )
  })

  it('throws rateLimit in embedText on 429 from the SDK', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key')
    mockEmbedContent.mockRejectedValue(sdkError(429))

    await expect(embedText('some text')).rejects.toThrow(
      'Rate limit reached. Please wait a moment and try again.',
    )
  })
})
