import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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
let getSearchIndexStatus: () => { isReady: boolean; processedCount: number; totalCount: number }

beforeEach(async () => {
  vi.resetModules()
  if (!window.requestIdleCallback) {
    window.requestIdleCallback = vi.fn((cb) => {
      const id = setTimeout(cb, 1)
      return Number(id)
    }) as unknown as typeof window.requestIdleCallback
  }

  const mod = await import('../searchIndex')
  search = mod.search
  preloadSearchIndex = mod.preloadSearchIndex
  getSearchIndexStatus = mod.getSearchIndexStatus
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('searchIndex', () => {
  it('returns no results for empty query', () => {
    expect(search('')).toEqual([])
    expect(search('   ')).toEqual([])
  })

  it('returns empty before any docs are processed and then returns partial results', async () => {
    expect(search('python')).toEqual([])

    await new Promise((resolve) => setTimeout(resolve, 5))

    const results = search('python')
    expect(results.length).toBeGreaterThan(0)
    expect((results[0] as { item: { day: string } }).item.day).toBe('11')
  })

  it('respects result limit', async () => {
    preloadSearchIndex()
    await new Promise((resolve) => setTimeout(resolve, 5))

    const results = search('11B', 1)
    expect(results.length).toBe(1)
  })

  it('supports background preloading via preloadSearchIndex and reports readiness progress', async () => {
    preloadSearchIndex()
    await new Promise((resolve) => setTimeout(resolve, 5))

    const status = getSearchIndexStatus()
    expect(status.totalCount).toBe(2)
    expect(status.processedCount).toBeGreaterThan(0)

    const results = search('sql')
    expect(results.length).toBeGreaterThan(0)
    expect((results[0] as { item: { title: string } }).item.title).toContain('SQL')
  })
})
