import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkGeminiAvailability, isGeminiAvailable } from '../geminiClient'

describe('gemini availability', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns false when VITE_GEMINI_API_KEY is not set', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '')

    expect(isGeminiAvailable()).toBe(false)
    await expect(checkGeminiAvailability()).resolves.toBe(false)
  })

  it('returns true when VITE_GEMINI_API_KEY is set', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key')

    await expect(checkGeminiAvailability()).resolves.toBe(true)
    expect(isGeminiAvailable()).toBe(true)
  })

  it('caches the availability result', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key')

    await expect(checkGeminiAvailability()).resolves.toBe(true)
    // Second call should return the same cached result
    await expect(checkGeminiAvailability()).resolves.toBe(true)
    expect(isGeminiAvailable()).toBe(true)
  })
})
