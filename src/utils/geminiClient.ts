/**
 * Gemini API Client
 *
 * Thin wrapper around backend Gemini endpoints for the AI Study Assistant.
 * Keeps Gemini API keys on the server side.
 *
 * @module utils/geminiClient
 */

const GEMINI_HEALTH_PATH = '/api/gemini/health'

const GEMINI_TIMEOUT_MS = clampNumber(
  Number(import.meta.env.VITE_GEMINI_TIMEOUT_MS),
  15_000,
  10_000,
  20_000,
)
const GEMINI_MAX_RETRIES = clampNumber(Number(import.meta.env.VITE_GEMINI_MAX_RETRIES), 3, 0, 5)
const GEMINI_RETRY_BASE_DELAY_MS = clampNumber(
  Number(import.meta.env.VITE_GEMINI_RETRY_BASE_DELAY_MS),
  500,
  100,
  2_000,
)
const GEMINI_RETRY_MAX_DELAY_MS = 4_000
const GEMINI_AVAILABILITY_CACHE_TTL_MS = 30_000
const GEMINI_AVAILABILITY_PROBE_TIMEOUT_MS = 1_500

interface GeminiAvailabilityCache {
  value: boolean
  expiresAt: number
  inFlightProbe?: Promise<boolean>
}

const geminiAvailabilityCache: GeminiAvailabilityCache = {
  value: false,
  expiresAt: 0,
}

const GEMINI_ERROR_MESSAGES = {
  timeout: 'Request timed out. Please try again.',
  rateLimit: 'Rate limit reached. Please wait a moment and try again.',
  serverUnavailable: 'Server unavailable. Please try again shortly.',
  invalidResponse: 'Invalid response from AI service. Please try again.',
} as const

type GeminiErrorCode = keyof typeof GEMINI_ERROR_MESSAGES

class GeminiClientError extends Error {
  code: GeminiErrorCode

  constructor(code: GeminiErrorCode) {
    super(GEMINI_ERROR_MESSAGES[code])
    this.name = 'GeminiClientError'
    this.code = code
  }
}

function clampNumber(value: number, fallback: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(Math.max(value, min), max)
}

function getGeminiApiBase(): string {
  const apiBase = ((import.meta.env.VITE_GEMINI_API_BASE as string | undefined) || '').trim()
  if (!apiBase) return ''

  try {
    const parsed = new URL(apiBase)
    return parsed.origin + parsed.pathname.replace(/\/$/, '')
  } catch {
    return ''
  }
}

function joinBaseAndPath(base: string, path: string): string {
  const normalizedBase = base.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

function getGeminiUrl(path: string): string {
  return joinBaseAndPath(getGeminiApiBase(), path)
}

function mapHttpStatusToError(status: number): GeminiClientError {
  if (status === 429) return new GeminiClientError('rateLimit')
  if (status >= 500) return new GeminiClientError('serverUnavailable')
  return new GeminiClientError('invalidResponse')
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500
}

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof GeminiClientError && error.code === 'timeout'
}

function shouldRetry(error: unknown): boolean {
  if (isTimeoutError(error) || isNetworkError(error)) return true
  if (error instanceof GeminiClientError) {
    return error.code === 'rateLimit' || error.code === 'serverUnavailable'
  }
  return false
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new GeminiClientError('timeout')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

async function postGemini<T>(url: string, payload: Record<string, unknown>): Promise<T> {
  let lastError: Error = new GeminiClientError('serverUnavailable')

  for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const mappedError = mapHttpStatusToError(response.status)
        if (isRetryableStatus(response.status) && attempt < GEMINI_MAX_RETRIES) {
          const delay = Math.min(
            GEMINI_RETRY_BASE_DELAY_MS * 2 ** attempt,
            GEMINI_RETRY_MAX_DELAY_MS,
          )
          await sleep(delay)
          continue
        }
        throw mappedError
      }

      try {
        return (await response.json()) as T
      } catch {
        throw new GeminiClientError('invalidResponse')
      }
    } catch (error) {
      const mappedError =
        error instanceof GeminiClientError
          ? error
          : isNetworkError(error)
            ? new GeminiClientError('serverUnavailable')
            : new GeminiClientError('invalidResponse')

      lastError = mappedError

      if (!shouldRetry(error) || attempt >= GEMINI_MAX_RETRIES) {
        throw mappedError
      }

      const delay = Math.min(GEMINI_RETRY_BASE_DELAY_MS * 2 ** attempt, GEMINI_RETRY_MAX_DELAY_MS)
      await sleep(delay)
    }
  }

  throw lastError
}

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

export interface Flashcard {
  front: string
  back: string
}

export function isGeminiAvailable(): boolean {
  const now = Date.now()
  const base = getGeminiApiBase()
  if (!base) return false
  if (geminiAvailabilityCache.expiresAt > now) {
    return geminiAvailabilityCache.value
  }
  return true
}

export async function checkGeminiAvailability(forceProbe = false): Promise<boolean> {
  const now = Date.now()
  const base = getGeminiApiBase()

  if (!base) {
    geminiAvailabilityCache.value = false
    geminiAvailabilityCache.expiresAt = now + GEMINI_AVAILABILITY_CACHE_TTL_MS
    return false
  }

  if (!forceProbe && geminiAvailabilityCache.expiresAt > now) {
    return geminiAvailabilityCache.value
  }

  if (!forceProbe && geminiAvailabilityCache.inFlightProbe) {
    return geminiAvailabilityCache.inFlightProbe
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_AVAILABILITY_PROBE_TIMEOUT_MS)

  const probePromise = fetch(getGeminiUrl(GEMINI_HEALTH_PATH), {
    method: 'GET',
    signal: controller.signal,
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      clearTimeout(timeoutId)
      geminiAvailabilityCache.inFlightProbe = undefined
    })

  geminiAvailabilityCache.inFlightProbe = probePromise

  const isHealthy = await probePromise
  geminiAvailabilityCache.value = isHealthy
  geminiAvailabilityCache.expiresAt = Date.now() + GEMINI_AVAILABILITY_CACHE_TTL_MS

  return isHealthy
}

async function callGemini(
  systemInstruction: string,
  userMessage: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const data = await postGemini<{ text?: string }>(getGeminiUrl('/api/gemini/generate'), {
    systemInstruction,
    userMessage,
    history,
  })

  const text = data.text
  if (!text) throw new GeminiClientError('invalidResponse')
  return text
}

function truncateContent(content: string, maxChars = 12_000): string {
  if (content.length <= maxChars) return content
  return content.slice(0, maxChars) + '\n\n[...content truncated for context window...]'
}

// ─── Feature 1: Lesson Q&A ──────────────────────────────────────────────────

const LESSON_QA_SYSTEM = `You are an expert MBA coding tutor for the "Coding for MBA" curriculum.
You help students understand lesson content clearly and concisely.

Rules:
- Answer ONLY based on the lesson content provided below.
- If the answer isn't in the lesson, say so honestly.
- Use simple language suitable for MBA students learning to code.
- Include code examples when helpful, using markdown code blocks.
- Keep answers focused and under 300 words unless complexity demands more.
- Use bullet points for multi-part answers.`

export async function askAboutLesson(
  lessonContent: string,
  question: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const system = `${LESSON_QA_SYSTEM}\n\n--- LESSON CONTENT ---\n${truncateContent(lessonContent)}\n--- END LESSON ---`
  return callGemini(system, question, history)
}

// ─── Feature 2: Flashcard Generation ─────────────────────────────────────────

const FLASHCARD_SYSTEM = `You are a flashcard generator for MBA coding students.
Generate exactly 8 flashcards from the lesson content below.

Rules:
- Each card tests ONE concept.
- Front: A clear, specific question.
- Back: A concise answer (1-3 sentences).
- Mix question types: definition, code output, "when to use", comparison.
- Return ONLY valid JSON array, no markdown fences.

Format: [{"front": "question", "back": "answer"}, ...]`

export async function generateFlashcards(lessonContent: string): Promise<Flashcard[]> {
  const system = `${FLASHCARD_SYSTEM}\n\n--- LESSON CONTENT ---\n${truncateContent(lessonContent)}\n--- END LESSON ---`
  const raw = await callGemini(system, 'Generate 8 flashcards from this lesson.')

  const cleaned = raw.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '')

  try {
    const parsed = JSON.parse(cleaned) as unknown
    if (!Array.isArray(parsed)) throw new Error('Not an array')
    return parsed.map((card: { front?: string; back?: string }) => ({
      front: card.front || 'No question',
      back: card.back || 'No answer',
    }))
  } catch {
    throw new Error('Failed to parse flashcards. Please try again.')
  }
}

// ─── Feature 3: Progressive Exercise Hints ───────────────────────────────────

const HINT_SYSTEMS: Record<1 | 2 | 3, string> = {
  1: `You are a gentle coding tutor. Give a LEVEL 1 hint (nudge only).
- DO NOT reveal the solution or approach.
- Ask a guiding question or point to a relevant concept.
- Keep it to 1-2 sentences.`,

  2: `You are a coding tutor. Give a LEVEL 2 hint (approach outline).
- Describe the general approach in 2-3 steps.
- Mention relevant functions or patterns by name.
- DO NOT write the actual code.`,

  3: `You are a coding tutor. Give a LEVEL 3 hint (near-solution).
- Provide a code skeleton with key parts replaced by comments.
- Show the structure but leave the core logic as TODO.
- Include which specific methods to use.`,
}

export async function getExerciseHint(
  exerciseTitle: string,
  exerciseGoal: string,
  starterCode: string,
  level: 1 | 2 | 3,
): Promise<string> {
  const system = HINT_SYSTEMS[level]
  const prompt = `Exercise: ${exerciseTitle}\nGoal: ${exerciseGoal}\nStarter code:\n${starterCode || '(no starter code)'}\n\nGive a level ${level} hint.`
  return callGemini(system, prompt)
}

// ─── Feature 4: Text Embeddings ──────────────────────────────────────────────

export async function embedText(text: string): Promise<number[]> {
  const data = await postGemini<{ embedding?: number[] }>(getGeminiUrl('/api/gemini/embed'), {
    text,
  })
  const values = data.embedding
  if (!values || values.length === 0) throw new GeminiClientError('invalidResponse')
  return values
}
