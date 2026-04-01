/**
 * Search Index Engine (Fuse.js)
 *
 * Configures the client-side full-text search engine for the curriculum.
 * Indexes lessons, concepts, and metadata.
 *
 * Key Responsibilities:
 * - Build searchable documents from lesson content.
 * - Configure Fuse.js weights (title > concepts > body).
 * - Generate result snippets with context.
 * - Preload the index during browser idle time.
 */

import Fuse, { type IFuseOptions } from 'fuse.js'
import { getAllLessons, type Lesson } from './contentLoader'
import { parseDayToken } from './dayToken'

/**
 * Represents a document in the search index, extending a standard Lesson
 * with additional pre-computed string fields optimized for searching and indexing.
 */
export interface SearchDocument extends Lesson {
  plainContent: string
  dayText: string
  phaseText: string
  titleLower: string
  conceptsLower: string
  tagsLower: string
  phaseTextLower: string
  dayTextLower: string
  plainContentLower: string
}

/**
 * Wraps a matched document and its ranking score.
 */
export interface SearchResult {
  item: SearchDocument
  score?: number
}

/**
 * Background search indexing status.
 */
export interface SearchIndexStatus {
  isReady: boolean
  isIndexing: boolean
  processedCount: number
  totalCount: number
}

const TITLE_WEIGHT = 8
const CONCEPT_WEIGHT = 4
const TAG_WEIGHT = 3
const PHASE_WEIGHT = 2
const DAY_WEIGHT = 2
const BODY_WEIGHT = 1

const FUSE_OPTIONS: IFuseOptions<SearchDocument> = {
  keys: [
    { name: 'title', weight: TITLE_WEIGHT },
    { name: 'concepts', weight: CONCEPT_WEIGHT },
    { name: 'tags', weight: TAG_WEIGHT },
    { name: 'phaseText', weight: PHASE_WEIGHT },
    { name: 'dayText', weight: DAY_WEIGHT },
    { name: 'plainContent', weight: BODY_WEIGHT },
  ],
  includeScore: true,
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
}

/**
 * Strips markdown syntax to create plain text for search indexing.
 * Optimized for performance by reducing regex passes and string allocations.
 */
function stripMarkdown(md: string): string {
  if (!md) return ''

  return (
    md
      // Keep code content and remove fence markers (` ```python ` / ` ``` `).
      .replace(/```[^\n]*\n?/g, ' ')
      // Keep identifier-like tokens from inline code while dropping wrapping ticks.
      .replace(/`([^`]+)`/g, '$1')
      // Keep human-readable alt text and link text.
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, ' $1 ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, ' $1 ')
      // Remove structural markdown syntax without touching intra-token punctuation.
      .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, ' ')
      .replace(/^\s{0,3}>\s?/gm, ' ')
      .replace(/^\s{0,3}#{1,6}\s+/gm, ' ')
      .replace(/^\s{0,3}(?:[-*_]\s*){3,}$/gm, ' ')
      // Remove emphasis markers only when used as wrappers around words.
      .replace(/(\*\*|__|~~)(?=\S)([\s\S]*?\S)\1/g, '$2')
      .replace(/(^|\s)([*_])(?=\S)([^\n]*?\S)\2(?=\s|$)/g, '$1$3')
      // Collapse whitespace deterministically.
      .replace(/\s+/g, ' ')
      .trim()
  )
}

function toDocument(lesson: Lesson): SearchDocument {
  const parsedDay = parseDayToken(lesson.day)
  const dayParts = parsedDay
    ? [
        `day ${parsedDay.token}`,
        `day ${parsedDay.number}`,
        parsedDay.suffix ? `day ${parsedDay.number} ${parsedDay.suffix}` : '',
      ]
    : [`day ${lesson.day}`]
  const plainContent = stripMarkdown(lesson.content || '')
  const dayText = dayParts.filter(Boolean).join(' ')
  const phaseText = `phase ${lesson.phase}`
  const conceptsLower = (lesson.concepts ?? []).join(' ').toLowerCase()
  const tagsLower = (lesson.tags ?? []).join(' ').toLowerCase()
  const title = lesson.title || ''

  return {
    ...lesson,
    plainContent,
    dayText,
    phaseText,
    titleLower: title.toLowerCase(),
    conceptsLower,
    tagsLower,
    phaseTextLower: phaseText.toLowerCase(),
    dayTextLower: dayText.toLowerCase(),
    plainContentLower: plainContent.toLowerCase(),
  }
}

function normalizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 || /^\d+$/.test(token))
}

function scoreField(text: string | undefined, terms: readonly string[], weight: number) {
  if (!text || terms.length === 0) return 0
  return terms.reduce((acc, term) => (text.includes(term) ? acc + weight : acc), 0)
}

/**
 * Calculates a ranking boost score for a search document based on query term occurrences.
 * Weighted fields (title, concepts, tags, phase, day, body) contribute to the final boost.
 *
 * @param {SearchDocument} doc - The search document to evaluate.
 * @param {readonly string[]} terms - The normalized search query terms.
 * @returns {number} The calculated ranking boost score.
 */
export function computeRankingBoost(doc: SearchDocument, terms: readonly string[]): number {
  return (
    scoreField(doc.titleLower, terms, TITLE_WEIGHT) +
    scoreField(doc.conceptsLower, terms, CONCEPT_WEIGHT) +
    scoreField(doc.tagsLower, terms, TAG_WEIGHT) +
    scoreField(doc.phaseTextLower, terms, PHASE_WEIGHT) +
    scoreField(doc.dayTextLower, terms, DAY_WEIGHT) +
    scoreField(doc.plainContentLower, terms, BODY_WEIGHT)
  )
}

/**
 * Creates search-optimized documents from an array of lessons.
 * Converts markdown content into plain text and extracts metadata for indexing.
 *
 * @param {readonly Lesson[]} lessons - An array of lessons to index.
 * @returns {SearchDocument[]} An array of generated search documents.
 */
export function createSearchDocuments(lessons: readonly Lesson[]): SearchDocument[] {
  return lessons.map(toDocument)
}

/**
 * Initializes a new Fuse.js search engine instance.
 *
 * @param {readonly Lesson[]} [lessons=getAllLessons()] - An array of lessons to populate the index.
 * @returns {Fuse<SearchDocument>} The initialized Fuse.js search engine.
 */
export function createSearchEngine(lessons = getAllLessons()): Fuse<SearchDocument> {
  return new Fuse(createSearchDocuments(lessons), FUSE_OPTIONS)
}

let cachedEngine: Fuse<SearchDocument> | null = null
let partialEngine: Fuse<SearchDocument> | null = null
const processedDocs: SearchDocument[] = []
let indexingComplete = false
let isIndexing = false
let currentIndex = 0
let allLessonsCache: readonly Lesson[] | null = null
const statusListeners = new Set<(status: SearchIndexStatus) => void>()

function getAllLessonsCached(): readonly Lesson[] {
  if (!allLessonsCache) {
    allLessonsCache = getAllLessons()
  }
  return allLessonsCache
}

function emitStatus() {
  const status = getSearchIndexStatus()
  statusListeners.forEach((listener) => listener(status))
}

/**
 * Retrieves the current status of the background search indexing process.
 *
 * @returns {SearchIndexStatus} The current indexing status object.
 */
export function getSearchIndexStatus(): SearchIndexStatus {
  const lessons = getAllLessonsCached()
  return {
    isReady: indexingComplete,
    isIndexing,
    processedCount: processedDocs.length,
    totalCount: lessons.length,
  }
}

/**
 * Subscribes a listener to receive real-time search indexing status updates.
 *
 * @param {(status: SearchIndexStatus) => void} listener - The callback function to invoke with status updates.
 * @returns {() => void} A cleanup function to unsubscribe the listener.
 */
export function subscribeSearchIndexStatus(
  listener: (status: SearchIndexStatus) => void,
): () => void {
  statusListeners.add(listener)
  listener(getSearchIndexStatus())
  return () => {
    statusListeners.delete(listener)
  }
}

function processChunk() {
  if (indexingComplete || cachedEngine) {
    indexingComplete = true
    isIndexing = false
    emitStatus()
    return
  }

  const allLessons = getAllLessonsCached()
  const startTime = performance.now()
  const CHUNK_TIME_LIMIT = 12 // ms

  while (currentIndex < allLessons.length && performance.now() - startTime < CHUNK_TIME_LIMIT) {
    const lesson = allLessons[currentIndex]
    if (lesson) {
      processedDocs.push(toDocument(lesson))
    }
    currentIndex++
  }

  partialEngine = new Fuse(processedDocs, FUSE_OPTIONS)
  emitStatus()

  if (currentIndex < allLessons.length) {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      ;(
        window as Window & {
          requestIdleCallback: (callback: () => void, options?: { timeout: number }) => void
        }
      ).requestIdleCallback(processChunk, { timeout: 1000 })
    } else {
      setTimeout(processChunk, 50)
    }
  } else {
    // Finished
    cachedEngine = partialEngine
    partialEngine = null
    indexingComplete = true
    isIndexing = false
    emitStatus()
  }
}

/**
 * Initiates background processing to build the search index.
 * It chunks document processing during browser idle time to avoid freezing the UI.
 * Once complete, the cached engine is available for fast searching.
 */
export function startBackgroundIndexing(): void {
  if (isIndexing || indexingComplete || cachedEngine) return
  isIndexing = true
  emitStatus()

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    ;(
      window as Window & {
        requestIdleCallback: (callback: () => void, options?: { timeout: number }) => void
      }
    ).requestIdleCallback(processChunk, { timeout: 1000 })
  } else {
    setTimeout(processChunk, 10)
  }
}

function getEngine(): Fuse<SearchDocument> | null {
  if (cachedEngine) return cachedEngine
  if (!isIndexing) {
    startBackgroundIndexing()
  }
  return partialEngine
}

/**
 * Executes a full-text search against the curriculum index.
 * Automatically triggers background indexing if not already started.
 *
 * @param {string} query - The search term or phrase.
 * @param {number} [limit=20] - The maximum number of results to return.
 * @returns {SearchResult[]} An array of search results, sorted by relevance score.
 */
export function search(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return []
  const engine = getEngine()
  if (!engine) return []
  const rawResults = engine.search(query, { limit: Math.max(limit * 2, 20) })

  const terms = normalizeQuery(query)

  return rawResults
    .map((result) => ({
      item: result.item,
      score: (result.score ?? 1) - computeRankingBoost(result.item, terms) / 100,
    }))
    .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
    .slice(0, limit)
}

/**
 * Extracts and normalizes individual unique terms from a search query.
 * Useful for highlighting matched terms in UI components.
 *
 * @param {string} query - The raw search query.
 * @returns {string[]} An array of normalized query terms.
 */
export function extractMatchedTerms(query: string): string[] {
  return Array.from(new Set(normalizeQuery(query)))
}

/**
 * Generates a context-aware snippet from document text based on a search query.
 * Attempts to extract a substring containing the first matched term, centered if possible.
 *
 * @param {string} content - The plain text document content.
 * @param {string} query - The original search query.
 * @param {number} [maxLength=180] - The maximum length of the generated snippet.
 * @returns {string} The text snippet, optionally truncated with ellipses.
 */
export function getSearchSnippet(content: string, query: string, maxLength = 180): string {
  const plain = content.trim()
  if (!plain) return ''

  const terms = extractMatchedTerms(query)
  if (terms.length === 0) return plain.slice(0, maxLength)

  const lower = plain.toLowerCase()
  const firstMatch = terms
    .map((term) => lower.indexOf(term))
    .filter((idx) => idx >= 0)
    .sort((a, b) => a - b)[0]

  if (firstMatch === undefined) return `${plain.slice(0, maxLength).trim()}…`

  const start = Math.max(0, firstMatch - Math.floor(maxLength / 3))
  const end = Math.min(plain.length, start + maxLength)
  const snippet = plain.slice(start, end).trim()
  return `${start > 0 ? '…' : ''}${snippet}${end < plain.length ? '…' : ''}`
}

/**
 * Safely triggers the background preloading of the search index.
 * Designed to be called on idle, deferring the heavy work of parsing documents.
 */
export function preloadSearchIndex(): void {
  try {
    startBackgroundIndexing()
  } catch (error) {
    console.error('Failed to start search index preloading:', error)
  }
}
