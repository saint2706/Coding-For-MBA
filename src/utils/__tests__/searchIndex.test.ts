import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  computeRankingBoost,
  createSearchDocuments,
  getSearchIndexStatus,
  subscribeSearchIndexStatus,
  search,
  extractMatchedTerms,
  getSearchSnippet,
} from '../searchIndex'

// Mock the dependencies
vi.mock('../../content/index', () => ({
  getAllLessons: vi.fn(() => [
    {
      id: 1,
      day: '1',
      phase: 1,
      title: 'Introduction to Python',
      content: 'This is an **introduction** to Python programming.',
      concepts: ['Variables', 'Types'],
      tags: ['basics'],
    },
    {
      id: 2,
      day: '2',
      phase: 1,
      title: 'Advanced Python',
      content: 'Let us dive deeper into Python. Functions and classes.',
      concepts: ['Functions', 'Classes'],
      tags: ['advanced'],
    },
  ]),
}))

vi.mock('../dayToken', () => ({
  parseDayToken: vi.fn((day) => ({
    token: day,
    number: parseInt(day),
    suffix: null,
  })),
  normalizeDayToken: vi.fn((day) => day),
  dayTokenFromPath: vi.fn((_path) => '1'),
}))

vi.mock('../contentLoader', () => ({
  getAllLessons: vi.fn(() => [
    {
      id: 1,
      day: '1',
      phase: 1,
      title: 'Introduction to Python',
      content: 'This is an **introduction** to Python programming.',
      concepts: ['Variables', 'Types'],
      tags: ['basics'],
    },
    {
      id: 2,
      day: '2',
      phase: 1,
      title: 'Advanced Python',
      content: 'Let us dive deeper into Python. Functions and classes.',
      concepts: ['Functions', 'Classes'],
      tags: ['advanced'],
    },
  ]),
}))

describe('searchIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('extractMatchedTerms', () => {
    it('normalizes and extracts unique terms', () => {
      const terms = extractMatchedTerms('Python PYTHON advanced 1')
      expect(terms).toEqual(['python', 'advanced', '1'])
    })

    it('ignores single character terms that are not digits', () => {
      const terms = extractMatchedTerms('a b c 1 python')
      expect(terms).toEqual(['1', 'python'])
    })
  })

  describe('getSearchSnippet', () => {
    it('returns empty string for empty content', () => {
      expect(getSearchSnippet('', 'test')).toBe('')
    })

    it('returns truncated content if no match', () => {
      expect(getSearchSnippet('a'.repeat(200), 'test', 10)).toBe('aaaaaaaaaa…')
    })

    it('centers snippet around match', () => {
      const content = 'prefix '.repeat(20) + 'match term' + ' suffix'.repeat(20)
      const snippet = getSearchSnippet(content, 'match', 30)
      expect(snippet).toContain('match')
      expect(snippet.length).toBeLessThanOrEqual(32) // account for ellipses
      expect(snippet.startsWith('…')).toBe(true)
      expect(snippet.endsWith('…')).toBe(true)
    })

    it('handles match near start', () => {
      const content = 'match term' + ' suffix'.repeat(20)
      const snippet = getSearchSnippet(content, 'match', 20)
      expect(snippet.startsWith('…')).toBe(false)
      expect(snippet.endsWith('…')).toBe(true)
    })
  })

  describe('computeRankingBoost', () => {
    it('calculates boost based on term occurrences', () => {
      const doc = {
        titleLower: 'test title',
        conceptsLower: 'concept test',
        tagsLower: 'tag test',
        phaseTextLower: 'phase test',
        dayTextLower: 'day test',
        plainContentLower: 'body test',
      } as any

      const score = computeRankingBoost(doc, ['test'])
      expect(score).toBeGreaterThan(0)
    })
  })

  describe('createSearchDocuments', () => {
    it('converts lessons to search documents', () => {
      const lessons = [
        {
          id: 1,
          day: '1',
          phase: 1,
          title: 'Title',
          content: '# Heading\nText **bold**',
          concepts: ['A'],
          tags: ['B'],
        },
      ] as any[]

      const docs = createSearchDocuments(lessons)
      expect(docs).toHaveLength(1)
      expect(docs[0]?.plainContent).toBe('Heading Text bold')
      expect(docs[0]?.titleLower).toBe('title')
      expect(docs[0]?.conceptsLower).toBe('a')
    })
  })

  describe('indexing and searching', () => {
    it('search triggers indexing and returns results', () => {
      // Need to clear module state for full test, but in this isolated test
      // search will trigger background index
      search('python')

      const status = getSearchIndexStatus()
      expect(status.isIndexing).toBe(true)

      // Advance timers to let requestIdleCallback or setTimeout finish
      vi.runAllTimers()

      const finalStatus = getSearchIndexStatus()
      expect(finalStatus.isIndexing).toBe(false)
      expect(finalStatus.isReady).toBe(true)

      const results = search('python')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.item.title.includes('Python')).toBe(true)
    })

    it('subscribeSearchIndexStatus works', () => {
      const listener = vi.fn()
      const unsubscribe = subscribeSearchIndexStatus(listener)

      expect(listener).toHaveBeenCalled() // initial call

      unsubscribe()
    })
  })
})
