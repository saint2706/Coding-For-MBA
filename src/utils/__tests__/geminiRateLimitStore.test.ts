import { beforeEach, describe, expect, it } from 'vitest'

import {
  __getRateLimitEntries,
  __resetRateLimitStore,
  checkRateLimit,
} from '../../../api/gemini/_shared.js'

function createReq(id: string) {
  return {
    headers: { 'x-user-id': id },
    socket: { remoteAddress: '127.0.0.1' },
  }
}

describe('checkRateLimit store maintenance', () => {
  beforeEach(() => {
    __resetRateLimitStore()
  })

  it('purges expired entries while preserving active ones during cleanup cadence', () => {
    checkRateLimit(createReq('expired-user'), 'generate', 5, 100, {
      now: 1_000,
      cleanupEveryNRequests: 999,
    })

    checkRateLimit(createReq('active-user'), 'generate', 5, 1_000, {
      now: 1_000,
      cleanupEveryNRequests: 999,
    })

    checkRateLimit(createReq('trigger-user'), 'generate', 5, 1_000, {
      now: 1_200,
      cleanupEveryNRequests: 1,
    })

    const keys = __getRateLimitEntries().map(([key]) => key)

    expect(keys).not.toContain('generate:127.0.0.1:expired-user')
    expect(keys).toContain('generate:127.0.0.1:active-user')
    expect(keys).toContain('generate:127.0.0.1:trigger-user')
  })

  it('trims oldest keys and keeps recently used entries when map exceeds max size', () => {
    checkRateLimit(createReq('a'), 'embed', 10, 5_000, {
      now: 0,
      maxEntries: 3,
      cleanupEveryNRequests: 999,
    })
    checkRateLimit(createReq('b'), 'embed', 10, 5_000, {
      now: 0,
      maxEntries: 3,
      cleanupEveryNRequests: 999,
    })
    checkRateLimit(createReq('c'), 'embed', 10, 5_000, {
      now: 0,
      maxEntries: 3,
      cleanupEveryNRequests: 999,
    })

    checkRateLimit(createReq('a'), 'embed', 10, 5_000, {
      now: 100,
      maxEntries: 3,
      cleanupEveryNRequests: 999,
    })
    checkRateLimit(createReq('d'), 'embed', 10, 5_000, {
      now: 100,
      maxEntries: 3,
      cleanupEveryNRequests: 999,
    })

    const keys = __getRateLimitEntries().map(([key]) => key)

    expect(keys).toContain('embed:127.0.0.1:a')
    expect(keys).toContain('embed:127.0.0.1:c')
    expect(keys).toContain('embed:127.0.0.1:d')
    expect(keys).not.toContain('embed:127.0.0.1:b')
  })
})
