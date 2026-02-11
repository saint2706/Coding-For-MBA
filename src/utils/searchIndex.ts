import Fuse, { type FuseResultMatch } from 'fuse.js'
import { getAllLessons } from './contentLoader'

// Strip markdown syntax to get plain text for better search and snippet display
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

// Build search documents from lessons
function buildSearchDocuments() {
  return getAllLessons().map((lesson) => ({
    ...lesson,
    plainContent: stripMarkdown(lesson.content),
  }))
}

export type SearchDocument = ReturnType<typeof buildSearchDocuments>[number]

export interface SearchResult {
  item: SearchDocument
  matches?: ReadonlyArray<FuseResultMatch>
  score?: number
}

// Fuse instance (created lazily on first search)
let fuseInstance: Fuse<SearchDocument> | null = null
let searchDocs: SearchDocument[] = []

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

export function search(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return []
  const fuse = getFuse()
  return fuse.search(query, { limit }) as SearchResult[]
}
