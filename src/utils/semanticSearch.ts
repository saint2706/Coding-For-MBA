/**
 * Semantic Search Utility
 *
 * Uses Gemini text embeddings + cosine similarity for semantic search
 * across all lessons. Falls back to Fuse.js if the API is unavailable.
 *
 * @module utils/semanticSearch
 */

import { getAllLessons, type Lesson } from './contentLoader'
import { embedText, isGeminiAvailable } from './geminiClient'
import { search as lexicalSearch } from './searchIndex'

interface EmbeddingCache {
  version: number
  embeddings: Record<string, number[]>
  metadata: {
    nextLessonCursor: number
    failedKeys: string[]
    updatedAt: number
  }
}

const CACHE_KEY = 'semantic-embeddings-v1'
const CACHE_VERSION = 1

export interface SemanticResult {
  lesson: Lesson
  score: number
}

export interface SemanticIndexingStatus {
  state: 'idle' | 'indexing' | 'complete'
  indexedLessons: number
  totalLessons: number
  failedLessons: number
}

function loadCache(): EmbeddingCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) {
      return {
        version: CACHE_VERSION,
        embeddings: {},
        metadata: { nextLessonCursor: 0, failedKeys: [], updatedAt: Date.now() },
      }
    }
    const parsed = JSON.parse(raw) as Partial<EmbeddingCache>
    if (parsed.version !== CACHE_VERSION) {
      return {
        version: CACHE_VERSION,
        embeddings: {},
        metadata: { nextLessonCursor: 0, failedKeys: [], updatedAt: Date.now() },
      }
    }
    return {
      version: CACHE_VERSION,
      embeddings: parsed.embeddings ?? {},
      metadata: {
        nextLessonCursor: Math.max(0, parsed.metadata?.nextLessonCursor ?? 0),
        failedKeys: parsed.metadata?.failedKeys ?? [],
        updatedAt: parsed.metadata?.updatedAt ?? Date.now(),
      },
    }
  } catch {
    return {
      version: CACHE_VERSION,
      embeddings: {},
      metadata: { nextLessonCursor: 0, failedKeys: [], updatedAt: Date.now() },
    }
  }
}

function saveCache(cache: EmbeddingCache): void {
  try {
    cache.metadata.updatedAt = Date.now()
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Silently fail if storage is full
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!
    normA += a[i]! * a[i]!
    normB += b[i]! * b[i]!
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

function stripMarkdownForEmbed(md: string): string {
  return md
    .replace(/```[\s\S]*?```|`[^`]*`|!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/(^\s*\d+\.\s+|^\s*[-*+]\s+|[#_~>|]+)/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)
}

const inFlightEmbeddings = new Map<string, Promise<number[]>>()
let indexingPromise: Promise<void> | null = null
const indexingListeners = new Set<() => void>()

function notifyIndexingListeners(): void {
  indexingListeners.forEach((listener) => listener())
}

/**
 * Subscribes a listener to semantic indexing status changes.
 *
 * @param {() => void} listener - The callback to execute when status changes.
 * @returns {() => void} A function to unsubscribe the listener.
 */
export function subscribeSemanticIndexing(listener: () => void): () => void {
  indexingListeners.add(listener)
  return () => {
    indexingListeners.delete(listener)
  }
}

async function getOrComputeEmbedding(
  key: string,
  text: string,
  cache: EmbeddingCache,
): Promise<number[]> {
  if (cache.embeddings[key]) return cache.embeddings[key]
  const inFlight = inFlightEmbeddings.get(key)
  if (inFlight) return inFlight

  const promise = embedText(text)
    .then((embedding) => {
      cache.embeddings[key] = embedding
      return embedding
    })
    .finally(() => {
      inFlightEmbeddings.delete(key)
    })
  inFlightEmbeddings.set(key, promise)
  return promise
}

function buildHybridResults(
  lessons: readonly Lesson[],
  query: string,
  queryEmbedding: number[],
  cache: EmbeddingCache,
  limit: number,
): SemanticResult[] {
  const lexicalResults = lexicalSearch(query, lessons.length)
  const lexicalScoreMap = new Map<string, number>()
  lexicalResults.forEach((result, index) => {
    const rankScore = 1 - index / Math.max(1, lexicalResults.length)
    lexicalScoreMap.set(String(result.item.day), rankScore)
  })

  return lessons
    .map((lesson) => {
      const key = String(lesson.day)
      const embedding = cache.embeddings[key]
      const lexicalFallback = lexicalScoreMap.get(key) ?? 0
      const score = embedding
        ? cosineSimilarity(queryEmbedding, embedding)
        : Math.max(0.01, lexicalFallback * 0.7)
      return { lesson, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Retrieves the current state and progress of background semantic indexing.
 *
 * @returns {SemanticIndexingStatus} An object describing the indexing status and progress.
 */
export function getSemanticIndexingStatus(): SemanticIndexingStatus {
  const cache = loadCache()
  const totalLessons = getAllLessons().length
  const indexedLessons = Object.keys(cache.embeddings).length
  const failedLessons = cache.metadata.failedKeys.length
  const complete = cache.metadata.nextLessonCursor >= totalLessons
  return {
    state: complete ? 'complete' : indexingPromise ? 'indexing' : 'idle',
    indexedLessons,
    totalLessons,
    failedLessons,
  }
}

function ensureBackgroundIndexing(
  cache: EmbeddingCache,
  lessons: readonly Lesson[],
): Promise<void> {
  if (indexingPromise) return indexingPromise

  indexingPromise = (async () => {
    const CONCURRENCY = 3
    let cursor = Math.min(cache.metadata.nextLessonCursor, lessons.length)
    while (cursor < lessons.length) {
      const batch = lessons.slice(cursor, cursor + CONCURRENCY)
      await Promise.all(
        batch.map(async (lesson) => {
          const key = String(lesson.day)
          if (cache.embeddings[key]) return
          try {
            await getOrComputeEmbedding(
              key,
              `${lesson.title}. ${stripMarkdownForEmbed(lesson.content)}`,
              cache,
            )
            cache.metadata.failedKeys = cache.metadata.failedKeys.filter((item) => item !== key)
          } catch {
            if (!cache.metadata.failedKeys.includes(key)) {
              cache.metadata.failedKeys.push(key)
            }
          }
        }),
      )
      cursor += batch.length
      cache.metadata.nextLessonCursor = cursor
      saveCache(cache)
      notifyIndexingListeners()
    }
  })().finally(() => {
    indexingPromise = null
    notifyIndexingListeners()
  })

  return indexingPromise
}

/**
 * Executes a hybrid semantic and lexical search against the lesson curriculum.
 * Triggers background semantic indexing if not already complete.
 *
 * @param {string} query - The search query.
 * @param {number} [limit=15] - Maximum number of results to return.
 * @param {(results: SemanticResult[]) => void} [onProgress] - Optional callback to receive partial results while indexing.
 * @returns {Promise<SemanticResult[]>} Resolves to an array of search results ordered by score.
 */
export async function semanticSearch(
  query: string,
  limit = 15,
  onProgress?: (results: SemanticResult[]) => void,
): Promise<SemanticResult[]> {
  if (!isGeminiAvailable()) {
    throw new Error('Gemini API not available')
  }

  const cache = loadCache()
  const lessons = getAllLessons()

  if (cache.metadata.nextLessonCursor > lessons.length) {
    cache.metadata.nextLessonCursor = 0
  }

  const queryEmbedding = await embedText(query)

  const initialResults = buildHybridResults(lessons, query, queryEmbedding, cache, limit)
  onProgress?.(initialResults)

  await ensureBackgroundIndexing(cache, lessons)

  const enrichedResults = buildHybridResults(lessons, query, queryEmbedding, cache, limit)
  onProgress?.(enrichedResults)
  return enrichedResults
}

/**
 * Clears the local storage cache of document embeddings.
 * Forces the system to re-index all documents on the next search.
 */
export function clearEmbeddingCache(): void {
  localStorage.removeItem(CACHE_KEY)
  notifyIndexingListeners()
}

/**
 * Returns the number of cached text embeddings currently stored.
 *
 * @returns {number} The count of cached embeddings.
 */
export function getEmbeddingCacheSize(): number {
  const cache = loadCache()
  return Object.keys(cache.embeddings).length
}
