const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const GENERATE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const EMBED_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent'

const rateLimitStore = globalThis.__geminiRateLimitStore ?? new Map()
globalThis.__geminiRateLimitStore = rateLimitStore

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(',')[0].trim()
  }

  return req.socket?.remoteAddress ?? 'unknown'
}

function getClientKey(req) {
  const ip = getClientIp(req)
  const userIdHeader = req.headers['x-user-id']
  const userId = typeof userIdHeader === 'string' ? userIdHeader.slice(0, 64) : 'anonymous'
  return `${ip}:${userId}`
}

function checkRateLimit(req, endpoint, maxRequests, windowMs) {
  const now = Date.now()
  const clientKey = `${endpoint}:${getClientKey(req)}`
  const entry = rateLimitStore.get(clientKey)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(clientKey, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    }
  }

  entry.count += 1
  rateLimitStore.set(clientKey, entry)
  return { allowed: true, retryAfterSeconds: 0 }
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
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 100_000) {
        reject(new Error('Payload too large'))
      }
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON payload'))
      }
    })
    req.on('error', reject)
  })
}

export function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function callGemini(url, body) {
  if (!GEMINI_API_KEY) {
    throw new Error('Server missing GEMINI_API_KEY')
  }

  const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const message = error?.error?.message || response.statusText
    throw new Error(message)
  }

  return response.json()
}

export async function handleGenerate(req, res) {
  const limit = checkRateLimit(req, 'generate', 30, 60_000)
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSeconds))
    return sendJson(res, 429, { error: 'Rate limit exceeded' })
  }

  const payload = await parseJsonBody(req)
  const validation = validateGeneratePayload(payload)
  if (!validation.valid) {
    return sendJson(res, 400, { error: validation.error })
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
    throw new Error('No response from Gemini')
  }

  return sendJson(res, 200, { text })
}

export async function handleEmbed(req, res) {
  const limit = checkRateLimit(req, 'embed', 300, 60_000)
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSeconds))
    return sendJson(res, 429, { error: 'Rate limit exceeded' })
  }

  const payload = await parseJsonBody(req)
  const validation = validateEmbedPayload(payload)
  if (!validation.valid) {
    return sendJson(res, 400, { error: validation.error })
  }

  const data = await callGemini(EMBED_URL, {
    content: { parts: [{ text: payload.text.slice(0, 2048) }] },
  })

  const embedding = data?.embedding?.values
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('No embedding returned')
  }

  return sendJson(res, 200, { embedding })
}

export async function withErrorHandling(handler, req, res) {
  try {
    await handler(req, res)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error'
    const status = message.startsWith('Server missing') ? 503 : 500
    sendJson(res, status, { error: message })
  }
}
