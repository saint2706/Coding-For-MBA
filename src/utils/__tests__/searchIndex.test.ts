import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'

const lessons = [
  {
    day: '11',
    daySortKey: '00011:',
    title: 'Intro to Python Variables',
    phase: 1,
    tags: ['python', 'basics'],
    concepts: ['variable'],
    content: '# Intro\nVariables store values.',
    path: '/content/lessons/Phase_1/README.md',
  },
  {
    day: '11B',
    daySortKey: '00011:B',
    title: 'SQL JOIN Deep Dive',
    phase: 2,
    tags: ['sql'],
    concepts: ['join'],
    content: 'Learn relational joins and indexing.',
    path: '/content/lessons/Phase_2/README.md',
  },
]

vi.mock('../contentLoader', () => ({
  getAllLessons: () => lessons,
}))

let search: (query: string, limit?: number) => unknown[]
let preloadSearchIndex: () => void

beforeEach(async () => {
  vi.resetModules()
  // Mock requestIdleCallback if it doesn't exist (Vitest env usually has window but maybe not RIC)
  if (!window.requestIdleCallback) {
    window.requestIdleCallback = vi.fn((cb) => {
      const id = setTimeout(cb, 1)
      return Number(id)
    }) as any
  }

  const mod = await import('../searchIndex')
  search = mod.search
  preloadSearchIndex = mod.preloadSearchIndex
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('searchIndex', () => {
  it('returns no results for empty query', () => {
    expect(search('')).toEqual([])
    expect(search('   ')).toEqual([])
  })

  it('finds and ranks likely results by relevance (synchronous fallback)', () => {
    // Calling search() immediately forces the index to build synchronously
    const results = search('python')
    expect(results.length).toBeGreaterThan(0)
    expect((results[0] as { item: { day: string } }).item.day).toBe('11')
  })

  it('respects result limit', () => {
    const results = search('11B', 1)
    expect(results.length).toBe(1)
  })

  it('supports background preloading via preloadSearchIndex', async () => {
    // Start background indexing
    preloadSearchIndex()

    // Even if background indexing is "in progress", search() should force finish it and return results
    const results = search('sql')
    expect(results.length).toBeGreaterThan(0)
    expect((results[0] as { item: { title: string } }).item.title).toContain('SQL')
  })
})
