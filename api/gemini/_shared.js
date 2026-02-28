import crypto from 'node:crypto'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const GENERATE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const EMBED_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent'

const rateLimitStore = globalThis.__geminiRateLimitStore ?? new Map()
globalThis.__geminiRateLimitStore = rateLimitStore
const rateLimitMeta = globalThis.__geminiRateLimitMeta ?? { requestCount: 0 }
globalThis.__geminiRateLimitMeta = rateLimitMeta

const RATE_LIMIT_CLEANUP_CADENCE = 50
const MAX_RATE_LIMIT_ENTRIES = 10_000

/**
 * Deployment assumption:
 * - Only enable forwarded header trust when traffic is known to come through
 *   a reverse proxy/load balancer that strips client-supplied forwarding headers.
 * - Proxies trusted for x-forwarded-for parsing are configured via GEMINI_TRUSTED_PROXIES.
 * - x-user-id is accepted only from authenticated middleware (req.auth.userId), or
 *   when its signature is verified with GEMINI_USER_ID_SIGNING_SECRET.
 */
function getTrustedProxySet() {
  return new Set(
    (process.env.GEMINI_TRUSTED_PROXIES ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  )
}

const ERROR_KIND = {
  VALIDATION: 'validation',
  RATE_LIMIT: 'rate_limit',
  UPSTREAM: 'upstream',
  CONFIG: 'config',
  UNEXPECTED: 'unexpected',
}

const PUBLIC_ERROR_MAP = {
  [ERROR_KIND.VALIDATION]: { status: 400, message: 'Invalid request' },
  [ERROR_KIND.RATE_LIMIT]: { status: 429, message: 'Too many requests' },
  [ERROR_KIND.UPSTREAM]: { status: 502, message: 'Service unavailable' },
  [ERROR_KIND.CONFIG]: { status: 503, message: 'Service unavailable' },
  [ERROR_KIND.UNEXPECTED]: { status: 500, message: 'Internal server error' },
}

export class InternalApiError extends Error {
  constructor(kind, details, options = {}) {
    super(details)
    this.name = 'InternalApiError'
    this.kind = kind
    this.details = details
    this.headers = options.headers ?? {}
  }
}

function createValidationError(details) {
  return new InternalApiError(ERROR_KIND.VALIDATION, details)
}

function createRateLimitError(retryAfterSeconds) {
  return new InternalApiError(ERROR_KIND.RATE_LIMIT, 'Rate limit exceeded', {
    headers: { 'Retry-After': String(retryAfterSeconds) },
  })
}

function createUpstreamError(details) {
  return new InternalApiError(ERROR_KIND.UPSTREAM, details)
}

function createConfigError(details) {
  return new InternalApiError(ERROR_KIND.CONFIG, details)
}

function createUnexpectedError(details) {
  return new InternalApiError(ERROR_KIND.UNEXPECTED, details)
}

function normalizeAddress(address) {
  if (typeof address !== 'string') {
    return null
  }

  if (address.startsWith('::ffff:')) {
    return address.slice(7)
  }

  return address
}

function isTrustedProxy(req) {
  const remoteAddress = normalizeAddress(req.socket?.remoteAddress)
  const trustedProxySet = getTrustedProxySet()

  if (!remoteAddress || trustedProxySet.size === 0) {
    return false
  }
  return trustedProxySet.has(remoteAddress)
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (isTrustedProxy(req) && typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }

  if (isTrustedProxy(req) && Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(',')[0].trim()
  }

  return normalizeAddress(req.socket?.remoteAddress) ?? 'unknown'
}

function getUserIdFromMiddleware(req) {
  if (typeof req.auth?.userId === 'string' && req.auth.userId.trim().length > 0) {
    return req.auth.userId.slice(0, 64)
  }

  return null
}

function getHeaderValue(req, key) {
  const value = req.headers[key]
  return typeof value === 'string' ? value : null
}

function isValidUserIdSignature(userId, signature) {
  const signingSecret = process.env.GEMINI_USER_ID_SIGNING_SECRET
  if (!signingSecret || !signature) {
    return false
  }

  const expected = crypto.createHmac('sha256', signingSecret).update(userId).digest('hex')

  if (signature.length !== expected.length) {
    return false
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

function getUserIdentity(req) {
  const middlewareUserId = getUserIdFromMiddleware(req)
  if (middlewareUserId) {
    return middlewareUserId
  }

  const userId = getHeaderValue(req, 'x-user-id')
  const signature =
    getHeaderValue(req, 'x-user-id-signature') ?? getHeaderValue(req, 'x-user-id-sig')

  if (userId && isValidUserIdSignature(userId, signature)) {
    return userId.slice(0, 64)
  }

  const sessionId = req.sessionID ?? req.session?.id
  if (typeof sessionId === 'string' && sessionId.trim().length > 0) {
    return `session:${sessionId.slice(0, 64)}`
  }

  return 'anonymous'
}

function getClientKey(req) {
  const ip = getClientIp(req)
  return `${ip}:${getUserIdentity(req)}`
}

function cleanupExpiredRateLimitEntries(now) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}

function trimRateLimitStore(maxEntries) {
  while (rateLimitStore.size > maxEntries) {
    const oldestKey = rateLimitStore.keys().next().value
    if (typeof oldestKey === 'undefined') {
      break
    }
    rateLimitStore.delete(oldestKey)
  }
}

export function checkRateLimit(req, endpoint, maxRequests, windowMs, options = {}) {
  const now = options.now ?? Date.now()
  const cleanupEveryNRequests = options.cleanupEveryNRequests ?? RATE_LIMIT_CLEANUP_CADENCE
  const maxEntries = options.maxEntries ?? MAX_RATE_LIMIT_ENTRIES

  rateLimitMeta.requestCount += 1
  if (rateLimitMeta.requestCount % cleanupEveryNRequests === 0) {
    cleanupExpiredRateLimitEntries(now)
  }

  const clientKey = `${endpoint}:${getClientKey(req)}`
  const entry = rateLimitStore.get(clientKey)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(clientKey, { count: 1, resetAt: now + windowMs })
    trimRateLimitStore(maxEntries)
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (entry.count >= maxRequests) {
    rateLimitStore.delete(clientKey)
    rateLimitStore.set(clientKey, entry)
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    }
  }

  entry.count += 1
  rateLimitStore.delete(clientKey)
  rateLimitStore.set(clientKey, entry)
  trimRateLimitStore(maxEntries)
  return { allowed: true, retryAfterSeconds: 0 }
}

export function __resetRateLimitStore() {
  rateLimitStore.clear()
  rateLimitMeta.requestCount = 0
}

export function __getRateLimitEntries() {
  return Array.from(rateLimitStore.entries())
}

function validateMessages(history) {
  if (!Array.isArray(history) || history.length > 30) {
    return { valid: false, error: 'history must be an array with at most 30 messages' }
  }

  for (const item of history) {
    const role = item?.role
    const text = item?.text
    if ((role !== 'user' && role !== 'model') || typeof text !== 'string' || text.length > 4000) {
      return { valid: false, error: 'each history message must include role (user|model) and text' }
    }
  }

  return { valid: true }
}

export function validateGeneratePayload(payload) {
  const { systemInstruction, userMessage, history = [] } = payload ?? {}
  if (typeof systemInstruction !== 'string' || systemInstruction.trim().length === 0) {
    return { valid: false, error: 'systemInstruction is required' }
  }
  if (systemInstruction.length > 16_000) {
    return { valid: false, error: 'systemInstruction exceeds max length' }
  }
  if (typeof userMessage !== 'string' || userMessage.trim().length === 0) {
    return { valid: false, error: 'userMessage is required' }
  }
  if (userMessage.length > 8_000) {
    return { valid: false, error: 'userMessage exceeds max length' }
  }

  return validateMessages(history)
}

export function validateEmbedPayload(payload) {
  const text = payload?.text
  if (typeof text !== 'string' || text.trim().length === 0) {
    return { valid: false, error: 'text is required' }
  }
  if (text.length > 4_096) {
    return { valid: false, error: 'text exceeds max length' }
  }
  return { valid: true }
}

export function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    let done = false

    const cleanup = () => {
      req.off('data', onData)
      req.off('end', onEnd)
      req.off('error', onError)
    }

    const resolveOnce = (value) => {
      if (done) {
        return
      }
      done = true
      cleanup()
      resolve(value)
    }

    const rejectOnce = (error) => {
      if (done) {
        return
      }
      done = true
      cleanup()
      reject(error)
    }

    const onData = (chunk) => {
      if (done) {
        return
      }

      body += chunk
      if (body.length > 100_000) {
        cleanup()
        if (typeof req.destroy === 'function' && !req.destroyed) {
          req.destroy()
        }
        rejectOnce(new Error('Payload too large'))
      }
    }

    const onEnd = () => {
      if (done) {
        return
      }
      try {
        resolveOnce(body ? JSON.parse(body) : {})
      } catch {
        rejectOnce(new Error('Invalid JSON payload'))
      }
    }

    const onError = (error) => {
      rejectOnce(error)
    }

    req.on('data', onData)
    req.on('end', onEnd)
    req.on('error', onError)
  })
}

export function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function callGemini(url, body) {
  if (!GEMINI_API_KEY) {
    throw createConfigError('Server missing GEMINI_API_KEY')
  }

  const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const message = error?.error?.message || response.statusText
    throw createUpstreamError(message)
  }

  return response.json()
}

export async function handleGenerate(req, res) {
  const limit = checkRateLimit(req, 'generate', 30, 60_000)
  if (!limit.allowed) {
    throw createRateLimitError(limit.retryAfterSeconds)
  }

  const payload = await parseJsonBody(req)
  const validation = validateGeneratePayload(payload)
  if (!validation.valid) {
    throw createValidationError(validation.error)
  }

  const { systemInstruction, userMessage, history = [] } = payload
  const contents = [
    ...history.map((msg) => ({ role: msg.role, parts: [{ text: msg.text }] })),
    { role: 'user', parts: [{ text: userMessage }] },
  ]

  const data = await callGemini(GENERATE_URL, {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      topP: 0.95,
    },
  })

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw createUpstreamError('No response from Gemini')
  }

  return sendJson(res, 200, { text })
}

export async function handleEmbed(req, res) {
  const limit = checkRateLimit(req, 'embed', 300, 60_000)
  if (!limit.allowed) {
    throw createRateLimitError(limit.retryAfterSeconds)
  }

  const payload = await parseJsonBody(req)
  const validation = validateEmbedPayload(payload)
  if (!validation.valid) {
    throw createValidationError(validation.error)
  }

  const data = await callGemini(EMBED_URL, {
    content: { parts: [{ text: payload.text.slice(0, 2048) }] },
  })

  const embedding = data?.embedding?.values
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw createUpstreamError('No embedding returned')
  }

  return sendJson(res, 200, { embedding })
}

export async function withErrorHandling(handler, req, res) {
  try {
    await handler(req, res)
  } catch (error) {
    const internalError =
      error instanceof InternalApiError
        ? error
        : createUnexpectedError(error instanceof Error ? error.message : 'Unknown error')
    const mapping = PUBLIC_ERROR_MAP[internalError.kind] ?? PUBLIC_ERROR_MAP[ERROR_KIND.UNEXPECTED]

    console.error('Gemini API error', {
      kind: internalError.kind,
      details: internalError.details,
      handler: handler.name,
    })

    Object.entries(internalError.headers).forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    sendJson(res, mapping.status, {
      error: {
        type: internalError.kind,
        message: mapping.message,
      },
    })
  }
}
