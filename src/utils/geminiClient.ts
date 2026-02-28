/**
 * Gemini API Client
 *
 * Thin wrapper around backend Gemini endpoints for the AI Study Assistant.
 * Keeps Gemini API keys on the server side.
 *
 * @module utils/geminiClient
 */

const GEMINI_API_BASE = (import.meta.env.VITE_GEMINI_API_BASE as string | undefined) || ''
const GENERATE_URL = `${GEMINI_API_BASE}/api/gemini/generate`
const EMBED_URL = `${GEMINI_API_BASE}/api/gemini/embed`

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

export interface Flashcard {
  front: string
  back: string
}

export function isGeminiAvailable(): boolean {
  return true
}

async function callGemini(
  systemInstruction: string,
  userMessage: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const response = await fetch(GENERATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction,
      userMessage,
      history,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const message = (error as { error?: string }).error || response.statusText
    throw new Error(`Gemini API error: ${message}`)
  }

  const data = (await response.json()) as { text?: string }
  const text = data.text
  if (!text) throw new Error('No response from Gemini')
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
  const response = await fetch(EMBED_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
    }),
  })

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.statusText}`)
  }

  const data = (await response.json()) as { embedding?: number[] }
  const values = data.embedding
  if (!values || values.length === 0) throw new Error('No embedding returned')
  return values
}
