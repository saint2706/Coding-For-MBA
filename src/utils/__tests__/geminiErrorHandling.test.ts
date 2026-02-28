import { afterEach, describe, expect, it, vi } from 'vitest'

import { InternalApiError, withErrorHandling } from '../../../api/gemini/_shared.js'

type MockResponse = {
  statusCode: number
  headers: Map<string, string>
  body: string
  setHeader: (name: string, value: string) => void
  end: (payload: string) => void
}

function createMockResponse(): MockResponse {
  return {
    statusCode: 200,
    headers: new Map(),
    body: '',
    setHeader(name: string, value: string) {
      this.headers.set(name, value)
    },
    end(payload: string) {
      this.body = payload
    },
  }
}

describe('withErrorHandling', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps validation errors to 400 with stable message', async () => {
    const req = {} as never
    const res = createMockResponse()
    const logger = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const handleGenerate = vi.fn(async () => {
      throw new InternalApiError('validation', 'userMessage is required')
    })

    await withErrorHandling(handleGenerate, req, res as never)

    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body)).toEqual({
      error: { type: 'validation', message: 'Invalid request' },
    })
    expect(logger).toHaveBeenCalled()
  })

  it('maps rate-limit errors to 429 and keeps retry-after header', async () => {
    const req = {} as never
    const res = createMockResponse()

    const handleGenerate = vi.fn(async () => {
      throw new InternalApiError('rate_limit', 'Rate limit exceeded', {
        headers: { 'Retry-After': '7' },
      })
    })

    await withErrorHandling(handleGenerate, req, res as never)

    expect(res.statusCode).toBe(429)
    expect(res.headers.get('Retry-After')).toBe('7')
    expect(JSON.parse(res.body)).toEqual({
      error: { type: 'rate_limit', message: 'Too many requests' },
    })
  })

  it('maps upstream errors to 502 with service unavailable message', async () => {
    const req = {} as never
    const res = createMockResponse()

    const handleEmbed = vi.fn(async () => {
      throw new InternalApiError('upstream', 'Provider timeout: socket hang up')
    })

    await withErrorHandling(handleEmbed, req, res as never)

    expect(res.statusCode).toBe(502)
    expect(JSON.parse(res.body)).toEqual({
      error: { type: 'upstream', message: 'Service unavailable' },
    })
  })

  it('maps config errors to 503 with service unavailable message', async () => {
    const req = {} as never
    const res = createMockResponse()

    const handleEmbed = vi.fn(async () => {
      throw new InternalApiError('config', 'Server missing GEMINI_API_KEY')
    })

    await withErrorHandling(handleEmbed, req, res as never)

    expect(res.statusCode).toBe(503)
    expect(JSON.parse(res.body)).toEqual({
      error: { type: 'config', message: 'Service unavailable' },
    })
  })

  it('maps unexpected errors to 500 and internal server error message', async () => {
    const req = {} as never
    const res = createMockResponse()

    const handleGenerate = vi.fn(async () => {
      throw new Error('socket reset by peer')
    })

    await withErrorHandling(handleGenerate, req, res as never)

    expect(res.statusCode).toBe(500)
    expect(JSON.parse(res.body)).toEqual({
      error: { type: 'unexpected', message: 'Internal server error' },
    })
  })
})
