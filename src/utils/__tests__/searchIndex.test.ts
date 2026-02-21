import { beforeEach, describe, expect, it, vi } from 'vitest'

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

beforeEach(async () => {
  vi.resetModules()
  ;({ search } = await import('../searchIndex'))
})

describe('searchIndex', () => {
  it('returns no results for empty query', () => {
    expect(search('')).toEqual([])
    expect(search('   ')).toEqual([])
  })

  it('finds and ranks likely results by relevance', () => {
    const results = search('python')
    expect(results.length).toBeGreaterThan(0)
    expect((results[0] as { item: { day: string } }).item.day).toBe('11')
  })

  it('respects result limit', () => {
    const results = search('11B', 1)
    expect(results.length).toBe(1)
  })
})
