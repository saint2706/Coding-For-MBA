import {
  clearReviewState,
  getDueReviewCards,
  getReviewCards,
  rateReviewCard,
  reviewStorageKey,
} from '../reviewTracker'

describe('reviewTracker', () => {
  beforeEach(() => {
    localStorage.clear()
    clearReviewState()
  })

  it('initializes all generated cards with default schedule', () => {
    const cards = getReviewCards(new Date('2025-01-01T00:00:00.000Z'))
    expect(cards.length).toBeGreaterThan(100)
    expect(cards.every((card) => card.state.repetitions === 0)).toBe(true)
  })

  it('updates card schedule and due filtering after rating', () => {
    const now = new Date('2025-01-01T00:00:00.000Z')
    const [first] = getReviewCards(now)
    expect(first).toBeDefined()

    rateReviewCard(first!.id, 'easy', now)
    const dueAfter = getDueReviewCards(new Date('2025-01-02T00:00:00.000Z'))

    expect(dueAfter.some((card) => card.id === first!.id)).toBe(false)
  })

  it('migrates legacy v1 object schema into versioned schema', () => {
    localStorage.setItem(
      reviewStorageKey,
      JSON.stringify({
        'legacy-card': {
          repetitions: 2,
          intervalDays: 5,
          easeFactor: 2.3,
          dueAt: '2025-01-01T00:00:00.000Z',
          lastReviewedAt: '2024-12-28T00:00:00.000Z',
        },
      }),
    )

    getReviewCards(new Date('2025-01-02T00:00:00.000Z'))
    const persisted = JSON.parse(localStorage.getItem(reviewStorageKey) || '{}') as {
      version?: number
      cards?: unknown[]
    }

    expect(persisted.version).toBe(2)
    expect(Array.isArray(persisted.cards)).toBe(true)
  })

  it('drops invalid schema payloads safely', () => {
    localStorage.setItem(reviewStorageKey, JSON.stringify({ version: 2, cards: [{ bad: true }] }))
    const cards = getReviewCards()
    expect(cards.length).toBeGreaterThan(0)
  })
})
