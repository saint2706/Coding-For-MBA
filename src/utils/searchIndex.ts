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
import { getAllLessons, type Lesson } from './contentLoader'

export interface SearchDocument extends Lesson {
  plainContent: string
  dayText: string
  phaseText: string
}

export interface SearchResult {
  item: SearchDocument
  score?: number
}

const TITLE_WEIGHT = 8
const CONCEPT_WEIGHT = 4
const TAG_WEIGHT = 3
const PHASE_WEIGHT = 2
const DAY_WEIGHT = 2
const BODY_WEIGHT = 1

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_~\-|]/g, ' ')
    .replace(/^\s*\d+\.\s+/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toDocument(lesson: Lesson): SearchDocument {
  return {
    ...lesson,
    plainContent: stripMarkdown(lesson.content),
    dayText: `day ${lesson.day}`,
    phaseText: `phase ${lesson.phase}`,
  }
}

function normalizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 || /^\d+$/.test(token))
}

function scoreField(
  text: string | readonly string[] | undefined,
  terms: readonly string[],
  weight: number,
) {
  if (!text || terms.length === 0) return 0
  const haystack = Array.isArray(text)
    ? text.join(' ').toLowerCase()
    : typeof text === 'string'
      ? text.toLowerCase()
      : ''
  return terms.reduce((acc, term) => (haystack.includes(term) ? acc + weight : acc), 0)
}

export function computeRankingBoost(doc: SearchDocument, query: string): number {
  const terms = normalizeQuery(query)
  return (
    scoreField(doc.title, terms, TITLE_WEIGHT) +
    scoreField(doc.concepts, terms, CONCEPT_WEIGHT) +
    scoreField(doc.tags, terms, TAG_WEIGHT) +
    scoreField(doc.phaseText, terms, PHASE_WEIGHT) +
    scoreField(doc.dayText, terms, DAY_WEIGHT) +
    scoreField(doc.plainContent, terms, BODY_WEIGHT)
  )
}

export function createSearchDocuments(lessons: readonly Lesson[]): SearchDocument[] {
  return lessons.map(toDocument)
}

export function createSearchEngine(lessons = getAllLessons()): Fuse<SearchDocument> {
  return new Fuse(createSearchDocuments(lessons), {
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
  })
}

let cachedEngine: Fuse<SearchDocument> | null = null

function getEngine(): Fuse<SearchDocument> {
  if (!cachedEngine) cachedEngine = createSearchEngine()
  return cachedEngine
}

export function search(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return []
  const rawResults = getEngine().search(query, { limit: Math.max(limit * 2, 20) })

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
  const preload = () => {
    try {
      getEngine()
    } catch (error) {
      console.error('Failed to preload search index:', error)
    }
  }

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    ;(
      window as Window & {
        requestIdleCallback: (callback: () => void, options?: { timeout: number }) => void
      }
    ).requestIdleCallback(preload, { timeout: 1000 })
    return
  }

  setTimeout(preload, 400)
}
