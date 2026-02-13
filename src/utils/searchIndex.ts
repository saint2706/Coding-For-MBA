/**
 * Search Index Module
 *
 * Provides full-text search functionality for lessons using Fuse.js.
 * Implements fuzzy search across lesson titles, tags, concepts, and content
 * with markdown syntax stripping for better search results.
 */

import Fuse, { type FuseResultMatch } from 'fuse.js'
import { getAllLessons } from './contentLoader'

/**
 * Strips markdown syntax to get plain text for better search and snippet display.
 *
 * Removes code blocks, inline code, headings, formatting, links, images,
 * list markers, blockquotes, tables, and horizontal rules.
 *
 * @param md - Raw markdown string
 * @returns Plain text with markdown syntax removed
 */
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]*`/g, '') // inline code
    .replace(/#{1,6}\s+/g, '') // headings
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1') // bold/italic/strikethrough
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // images
    .replace(/^\s*[-*+]\s+/gm, '') // list markers
    .replace(/^\s*\d+\.\s+/gm, '') // ordered list markers
    .replace(/^\s*>\s+/gm, '') // blockquotes
    .replace(/\|/g, ' ') // table separators
    .replace(/-{3,}/g, '') // horizontal rules
    .replace(/\n{2,}/g, '\n') // collapse multiple newlines
    .trim()
}

/**
 * Builds search documents from all lessons with plain text content.
 *
 * @returns Array of lesson objects with added plainContent field
 */
function buildSearchDocuments() {
  return getAllLessons().map((lesson) => ({
    ...lesson,
    plainContent: stripMarkdown(lesson.content),
  }))
}

/**
 * Type representing a lesson document prepared for search indexing.
 * Extends the base Lesson type with a plainContent field.
 */
export type SearchDocument = ReturnType<typeof buildSearchDocuments>[number]

/**
 * Represents a search result with the matched document and relevance information.
 */
export interface SearchResult {
  item: SearchDocument
  matches?: ReadonlyArray<FuseResultMatch>
  score?: number
}

/**
 * Fuse.js instance for fuzzy search (created lazily on first search).
 */
let fuseInstance: Fuse<SearchDocument> | null = null

/**
 * Cached search documents array.
 */
let searchDocs: SearchDocument[] = []

/**
 * Gets or creates the Fuse.js search instance.
 *
 * Lazily initializes the search index with weighted keys:
 * - title: 3x weight
 * - tags: 2x weight
 * - concepts: 2x weight
 * - plainContent: 1x weight
 *
 * @returns Configured Fuse.js instance
 */
function getFuse(): Fuse<SearchDocument> {
  if (!fuseInstance) {
    searchDocs = buildSearchDocuments()
    fuseInstance = new Fuse(searchDocs, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'tags', weight: 2 },
        { name: 'concepts', weight: 2 },
        { name: 'plainContent', weight: 1 },
      ],
      includeMatches: true,
      includeScore: true,
      threshold: 0.4,
      minMatchCharLength: 2,
      ignoreLocation: true,
    })
  }
  return fuseInstance
}

/**
 * Performs a fuzzy search across all lessons.
 *
 * Searches lesson titles, tags, concepts, and content for matches.
 * Returns results sorted by relevance score with highlighted match information.
 *
 * @param query - Search query string
 * @param limit - Maximum number of results to return (default: 20)
 * @returns Array of search results with match information
 */
export function search(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return []
  const fuse = getFuse()
  return fuse.search(query, { limit }) as SearchResult[]
}

/**
 * Preloads the search index in the background to avoid jank on first search.
 * This should be called when the application is idle.
 */
export function preloadSearchIndex(): void {
  // Use requestIdleCallback if available, otherwise fallback to setTimeout
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).requestIdleCallback(
      () => {
        getFuse()
      },
      { timeout: 2000 },
    )
  } else {
    setTimeout(() => {
      getFuse()
    }, 1000)
  }
}
