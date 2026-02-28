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

import Fuse from 'fuse.js'
import type { IFuseOptions } from 'fuse.js'
import { getAllLessons, type Lesson } from './contentLoader'
import { parseDayToken } from './dayToken'

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

export interface SearchResult {
  item: SearchDocument
  score?: number
}

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
      // Combined pass: Remove code blocks, inline code, and images
      .replace(/```[\s\S]*?```|`[^`]*`|!\[[^\]]*\]\([^)]+\)/g, ' ')
      // Pass 2: Extract text from links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Pass 3: Remove list markers (ordered/unordered), headers, blockquotes, horizontal rules
      .replace(/(^\s*\d+\.\s+|^\s*[-*+]\s+|[#_~>|]+)/gm, ' ')
      // Pass 4: Collapse whitespace
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

export function computeRankingBoost(doc: SearchDocument, query: string): number {
  const terms = normalizeQuery(query)
  return (
    scoreField(doc.titleLower, terms, TITLE_WEIGHT) +
    scoreField(doc.conceptsLower, terms, CONCEPT_WEIGHT) +
    scoreField(doc.tagsLower, terms, TAG_WEIGHT) +
    scoreField(doc.phaseTextLower, terms, PHASE_WEIGHT) +
    scoreField(doc.dayTextLower, terms, DAY_WEIGHT) +
    scoreField(doc.plainContentLower, terms, BODY_WEIGHT)
  )
}

export function createSearchDocuments(lessons: readonly Lesson[]): SearchDocument[] {
  return lessons.map(toDocument)
}

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

export function getSearchIndexStatus(): SearchIndexStatus {
  const lessons = getAllLessonsCached()
  return {
    isReady: indexingComplete,
    isIndexing,
    processedCount: processedDocs.length,
    totalCount: lessons.length,
  }
}

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

export function search(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return []
  const engine = getEngine()
  if (!engine) return []
  const rawResults = engine.search(query, { limit: Math.max(limit * 2, 20) })

  return rawResults
    .map((result) => ({
      item: result.item,
      score: (result.score ?? 1) - computeRankingBoost(result.item, query) / 100,
    }))
    .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
    .slice(0, limit)
}

export function extractMatchedTerms(query: string): string[] {
  return Array.from(new Set(normalizeQuery(query)))
}

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

export function preloadSearchIndex(): void {
  try {
    startBackgroundIndexing()
  } catch (error) {
    console.error('Failed to start search index preloading:', error)
  }
}
