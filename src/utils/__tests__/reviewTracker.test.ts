import {
  clearReviewState,
  getDueReviewCards,
  getReviewCards,
  rateReviewCard,
  reviewStorageKey,
  getReviewStreak,
  getReviewDueCountByPhase
} from '../reviewTracker'

describe('reviewTracker', () => {
  beforeEach(() => {
    // Basic localStorage mock for JSDOM
    const store: Record<string, string> = {}
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString()
        },
        clear: () => {
          for (const key in store) delete store[key]
        },
        removeItem: (key: string) => {
          delete store[key]
        },
      },
      writable: true,
    })

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

  it('calculates review streak correctly', () => {
    const today = new Date('2025-01-05T00:00:00.000Z')
    const yesterday = new Date('2025-01-04T00:00:00.000Z')
    // const twoDaysAgo = new Date('2025-01-03T00:00:00.000Z')

    // No reviews
    expect(getReviewStreak(today)).toBe(0)

    // Review today
    const cards = getReviewCards(today)
    const card1 = cards[0]
    const card2 = cards[1]

    if (!card1 || !card2) throw new Error('Not enough cards generated for test')

    rateReviewCard(card1.id, 'good', today)
    expect(getReviewStreak(today)).toBe(1)

    // Review yesterday
    rateReviewCard(card2.id, 'good', yesterday)

    // Streak should be 2
    expect(getReviewStreak(today)).toBe(2)

    // Break the streak (missed Jan 3rd)
    // Add review on Jan 2nd
    const jan2 = new Date('2025-01-02T00:00:00.000Z')

    // Let's review a DIFFERENT card on Jan 2nd.
    const card3 = cards[2]
    if (!card3) throw new Error('Not enough cards generated for test')

    rateReviewCard(card3.id, 'good', jan2)

    // So reviews on: Jan 5, Jan 4, Jan 2.
    // Missing Jan 3.
    // Streak should be 2.
    expect(getReviewStreak(today)).toBe(2)
  })

  it('counts due cards by phase', () => {
      const now = new Date()
      // Initially all cards are due (default state dueAt is now)

      const counts = getReviewDueCountByPhase(now)
      expect(Object.keys(counts).length).toBeGreaterThan(0)

      // Check if phase 1 has cards
      const phase1Cards = getReviewCards(now).filter(c => c.phase === 1)
      if (phase1Cards.length > 0) {
          expect(counts[1]).toBeDefined()
          expect(counts[1]).toBe(phase1Cards.length)

          // Complete one phase 1 card
          if (phase1Cards[0]) {
            rateReviewCard(phase1Cards[0].id, 'easy', now)
            const newCounts = getReviewDueCountByPhase(now)
            expect(newCounts[1]).toBe(phase1Cards.length - 1)
          }
      }
  })
})
