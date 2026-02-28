import crypto from 'node:crypto'

import { beforeEach, describe, expect, it } from 'vitest'

import {
  __getRateLimitEntries,
  __resetRateLimitStore,
  checkRateLimit,
} from '../../../api/gemini/_shared.js'

function createReq(
  id: string,
  options: {
    forwardedFor?: string
    remoteAddress?: string
    sessionId?: string
    userIdSignature?: string
    authUserId?: string
  } = {},
) {
  const headers: Record<string, string> = {}

  if (id) {
    headers['x-user-id'] = id
  }

  if (options.forwardedFor) {
    headers['x-forwarded-for'] = options.forwardedFor
  }

  if (options.userIdSignature) {
    headers['x-user-id-signature'] = options.userIdSignature
  }

  return {
    auth: options.authUserId ? { userId: options.authUserId } : undefined,
    headers,
    sessionID: options.sessionId,
    socket: { remoteAddress: options.remoteAddress ?? '127.0.0.1' },
  }
}

describe('checkRateLimit store maintenance', () => {
  beforeEach(() => {
    __resetRateLimitStore()
    delete process.env.GEMINI_TRUSTED_PROXIES
    delete process.env.GEMINI_USER_ID_SIGNING_SECRET
  })

  it('purges expired entries while preserving active ones during cleanup cadence', () => {
    checkRateLimit(createReq('expired-user', { authUserId: 'expired-user' }), 'generate', 5, 100, {
      now: 1_000,
      cleanupEveryNRequests: 999,
    })

    checkRateLimit(createReq('active-user', { authUserId: 'active-user' }), 'generate', 5, 1_000, {
      now: 1_000,
      cleanupEveryNRequests: 999,
    })

    checkRateLimit(
      createReq('trigger-user', { authUserId: 'trigger-user' }),
      'generate',
      5,
      1_000,
      {
        now: 1_200,
        cleanupEveryNRequests: 1,
      },
    )

    const keys = __getRateLimitEntries().map(([key]) => key)

    expect(keys).not.toContain('generate:127.0.0.1:expired-user')
    expect(keys).toContain('generate:127.0.0.1:active-user')
    expect(keys).toContain('generate:127.0.0.1:trigger-user')
  })

  it('trims oldest keys and keeps recently used entries when map exceeds max size', () => {
    checkRateLimit(createReq('a', { authUserId: 'a' }), 'embed', 10, 5_000, {
      now: 0,
      maxEntries: 3,
      cleanupEveryNRequests: 999,
    })
    checkRateLimit(createReq('b', { authUserId: 'b' }), 'embed', 10, 5_000, {
      now: 0,
      maxEntries: 3,
      cleanupEveryNRequests: 999,
    })
    checkRateLimit(createReq('c', { authUserId: 'c' }), 'embed', 10, 5_000, {
      now: 0,
      maxEntries: 3,
      cleanupEveryNRequests: 999,
    })

    checkRateLimit(createReq('a', { authUserId: 'a' }), 'embed', 10, 5_000, {
      now: 100,
      maxEntries: 3,
      cleanupEveryNRequests: 999,
    })
    checkRateLimit(createReq('d', { authUserId: 'd' }), 'embed', 10, 5_000, {
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

  it('ignores spoofed x-forwarded-for when remote address is not trusted', () => {
    checkRateLimit(
      createReq('real-user', {
        forwardedFor: '198.51.100.7',
        remoteAddress: '10.0.0.7',
      }),
      'generate',
      5,
      1_000,
      { now: 0, cleanupEveryNRequests: 999 },
    )

    const [key] = __getRateLimitEntries().map(([entryKey]) => entryKey)

    expect(key).toContain('generate:10.0.0.7:')
    expect(key).not.toContain('198.51.100.7')
  })

  it('trusts x-forwarded-for when request comes from a known proxy IP', () => {
    process.env.GEMINI_TRUSTED_PROXIES = '10.0.0.8'

    checkRateLimit(
      createReq('real-user', {
        forwardedFor: '198.51.100.22',
        remoteAddress: '10.0.0.8',
      }),
      'generate',
      5,
      1_000,
      { now: 0, cleanupEveryNRequests: 999 },
    )

    const [key] = __getRateLimitEntries().map(([entryKey]) => entryKey)

    expect(key).toContain('generate:198.51.100.22:')
    expect(key).not.toContain('10.0.0.8')
  })

  it('ignores unsigned x-user-id and falls back to session identity', () => {
    checkRateLimit(
      createReq('spoofed-user', {
        remoteAddress: '10.0.0.9',
        sessionId: 'session-123',
      }),
      'embed',
      5,
      1_000,
      { now: 0, cleanupEveryNRequests: 999 },
    )

    const [key] = __getRateLimitEntries().map(([entryKey]) => entryKey)

    expect(key).toBe('embed:10.0.0.9:session:session-123')
  })

  it('accepts signed x-user-id when signature matches', () => {
    process.env.GEMINI_USER_ID_SIGNING_SECRET = 'test-signing-secret'
    const userId = 'signed-user'
    const signature = crypto
      .createHmac('sha256', process.env.GEMINI_USER_ID_SIGNING_SECRET)
      .update(userId)
      .digest('hex')

    checkRateLimit(
      createReq(userId, {
        userIdSignature: signature,
        remoteAddress: '10.0.0.11',
      }),
      'embed',
      5,
      1_000,
      { now: 0, cleanupEveryNRequests: 999 },
    )

    const [key] = __getRateLimitEntries().map(([entryKey]) => entryKey)

    expect(key).toBe('embed:10.0.0.11:signed-user')
  })

  it('prioritizes authenticated middleware user id over spoofable headers', () => {
    checkRateLimit(
      createReq('spoofed-user', {
        authUserId: 'trusted-user',
        remoteAddress: '10.0.0.10',
        sessionId: 'session-999',
      }),
      'generate',
      5,
      1_000,
      { now: 0, cleanupEveryNRequests: 999 },
    )

    const [key] = __getRateLimitEntries().map(([entryKey]) => entryKey)

    expect(key).toBe('generate:10.0.0.10:trusted-user')
  })
})
