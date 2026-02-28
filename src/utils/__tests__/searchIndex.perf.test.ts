import { beforeEach, describe, expect, it, vi } from 'vitest'

const lessons = Array.from({ length: 1500 }, (_, i) => ({
  day: String(i + 1),
  daySortKey: String(i + 1).padStart(5, '0') + ':',
  title: i === 1499 ? 'Corporate Finance Search Target' : `Lesson ${i + 1}`,
  phase: 1,
  tags: ['finance', 'mba'],
  concepts: ['valuation'],
  content: `Long lesson ${i + 1} content `.repeat(20),
  path: `/fake/${i + 1}`,
}))

vi.mock('../contentLoader', () => ({
  getAllLessons: () => lessons,
}))

describe('searchIndex first-search performance', () => {
  beforeEach(() => {
    vi.resetModules()
    if (!window.requestIdleCallback) {
      window.requestIdleCallback = vi.fn((cb) => {
        const id = setTimeout(cb, 1)
        return Number(id)
      }) as any
    }
  })

  it('keeps first-search latency low while indexing in background', async () => {
    const { preloadSearchIndex, search } = await import('../searchIndex')

    preloadSearchIndex()

    const start = performance.now()
    const immediateResults = search('corporate finance')
    const elapsedMs = performance.now() - start

    expect(immediateResults).toEqual([])
    expect(elapsedMs).toBeLessThan(50)

    let laterResults = search('corporate finance')
    for (let i = 0; i < 20 && laterResults.length === 0; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20))
      laterResults = search('corporate finance')
    }

    expect(laterResults.length).toBeGreaterThan(0)
  })
})
