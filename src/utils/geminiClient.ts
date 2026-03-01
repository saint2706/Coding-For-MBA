/**
 * Gemini API Client
 *
 * Wrapper around the Google Generative AI SDK for the AI Study Assistant.
 * Uses VITE_GEMINI_API_KEY for direct browser-to-Gemini API access.
 *
 * @module utils/geminiClient
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_GENERATE_MODEL = 'gemini-flash-latest'
const GEMINI_EMBED_MODEL = 'text-embedding-004'
// Maximum characters sent to the embedding model to stay within token limits
const GEMINI_EMBED_MAX_CHARS = 2_048

const GEMINI_TIMEOUT_MS = clampNumber(
  Number(import.meta.env.VITE_GEMINI_TIMEOUT_MS),
  15_000,
  10_000,
  20_000,
)
const GEMINI_AVAILABILITY_CACHE_TTL_MS = 30_000

interface GeminiAvailabilityCache {
  value: boolean
  expiresAt: number
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

function getGeminiApiKey(): string {
  return ((import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || '').trim()
}

function getGenerativeAI(): GoogleGenerativeAI | null {
  const apiKey = getGeminiApiKey()
  if (!apiKey) return null
  return new GoogleGenerativeAI(apiKey)
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new GeminiClientError('timeout')), ms)
  })
  return Promise.race([promise.finally(() => clearTimeout(timeoutId)), timeoutPromise])
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'model'
  text: string
}

export interface Flashcard {
  id?: string
  front: string
  back: string
}

const FLASHCARD_COUNT = 8
const FLASHCARD_FRONT_MAX_LENGTH = 160
const FLASHCARD_BACK_MAX_LENGTH = 400
const FLASHCARD_RETRY_ERROR_MESSAGE =
  'We could not generate valid flashcards this time. Please try again.'

export function isGeminiAvailable(): boolean {
  const now = Date.now()
  const apiKey = getGeminiApiKey()
  if (!apiKey) return false
  if (geminiAvailabilityCache.expiresAt > now) {
    return geminiAvailabilityCache.value
  }
  return true
}

export async function checkGeminiAvailability(): Promise<boolean> {
  const now = Date.now()
  const available = !!getGeminiApiKey()
  geminiAvailabilityCache.value = available
  geminiAvailabilityCache.expiresAt = now + GEMINI_AVAILABILITY_CACHE_TTL_MS
  return available
}

async function callGemini(
  systemInstruction: string,
  userMessage: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const genAI = getGenerativeAI()
  if (!genAI) throw new GeminiClientError('serverUnavailable')

  const model = genAI.getGenerativeModel({ model: GEMINI_GENERATE_MODEL })

  try {
    const chat = model.startChat({
      systemInstruction,
      history: history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.95,
      },
    })

    const result = await withTimeout(chat.sendMessage(userMessage), GEMINI_TIMEOUT_MS)
    const text = result.response.text()
    if (!text) throw new GeminiClientError('invalidResponse')
    return text
  } catch (error) {
    if (error instanceof GeminiClientError) throw error
    throw new GeminiClientError('serverUnavailable')
  }
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
    if (!Array.isArray(parsed) || parsed.length !== FLASHCARD_COUNT) {
      throw new Error('Invalid flashcard count')
    }

    return parsed.map((card) => {
      if (typeof card !== 'object' || card === null || Array.isArray(card)) {
        throw new Error('Invalid flashcard item type')
      }

      const { front, back } = card as { front?: unknown; back?: unknown }
      if (typeof front !== 'string' || typeof back !== 'string') {
        throw new Error('Invalid flashcard field type')
      }

      const trimmedFront = front.trim()
      const trimmedBack = back.trim()

      if (
        trimmedFront.length === 0 ||
        trimmedBack.length === 0 ||
        trimmedFront.length > FLASHCARD_FRONT_MAX_LENGTH ||
        trimmedBack.length > FLASHCARD_BACK_MAX_LENGTH
      ) {
        throw new Error('Invalid flashcard field value')
      }

      return { front: trimmedFront, back: trimmedBack }
    })
  } catch {
    throw new Error(FLASHCARD_RETRY_ERROR_MESSAGE)
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
  const genAI = getGenerativeAI()
  if (!genAI) throw new GeminiClientError('serverUnavailable')

  const model = genAI.getGenerativeModel({ model: GEMINI_EMBED_MODEL })

  try {
    const result = await withTimeout(
      model.embedContent(text.slice(0, GEMINI_EMBED_MAX_CHARS)),
      GEMINI_TIMEOUT_MS,
    )
    const values = result.embedding?.values
    if (!values || values.length === 0) throw new GeminiClientError('invalidResponse')
    return values
  } catch (error) {
    if (error instanceof GeminiClientError) throw error
    throw new GeminiClientError('serverUnavailable')
  }
}
