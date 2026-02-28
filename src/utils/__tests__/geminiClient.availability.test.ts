import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadGeminiClient() {
  vi.resetModules()
  return import('../geminiClient')
}

describe('gemini availability', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.useRealTimers()
  })

  it('returns false when VITE_GEMINI_API_BASE is empty', async () => {
    vi.stubEnv('VITE_GEMINI_API_BASE', '')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const geminiClient = await loadGeminiClient()

    expect(geminiClient.isGeminiAvailable()).toBe(false)
    await expect(geminiClient.checkGeminiAvailability(true)).resolves.toBe(false)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns false when VITE_GEMINI_API_BASE is malformed', async () => {
    vi.stubEnv('VITE_GEMINI_API_BASE', 'not-a-url')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const geminiClient = await loadGeminiClient()

    expect(geminiClient.isGeminiAvailable()).toBe(false)
    await expect(geminiClient.checkGeminiAvailability(true)).resolves.toBe(false)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns true for a healthy backend and caches the probe result', async () => {
    vi.stubEnv('VITE_GEMINI_API_BASE', 'https://api.example.com/')
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true } as Response)

    const geminiClient = await loadGeminiClient()

    await expect(geminiClient.checkGeminiAvailability()).resolves.toBe(true)
    expect(geminiClient.isGeminiAvailable()).toBe(true)

    await expect(geminiClient.checkGeminiAvailability()).resolves.toBe(true)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/api/gemini/health', {
      method: 'GET',
      signal: expect.any(AbortSignal),
    })
  })

  it('returns false when the health probe times out', async () => {
    vi.useFakeTimers()
    vi.stubEnv('VITE_GEMINI_API_BASE', 'https://api.example.com')

    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'))
          })
        }),
    )

    const geminiClient = await loadGeminiClient()
    const probePromise = geminiClient.checkGeminiAvailability(true)

    await vi.advanceTimersByTimeAsync(1_500)

    await expect(probePromise).resolves.toBe(false)
    expect(geminiClient.isGeminiAvailable()).toBe(false)
  })
})
