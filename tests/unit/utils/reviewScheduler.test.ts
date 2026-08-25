import {
  createInitialSchedulingState,
  isCardDue,
  scheduleReview,
} from '../../../src/utils/reviewScheduler'

describe('reviewScheduler', () => {
  it('creates deterministic initial state', () => {
    const now = new Date('2025-01-01T00:00:00.000Z')
    const state = createInitialSchedulingState(now)

    expect(state.repetitions).toBe(0)
    expect(state.intervalDays).toBe(0)
    expect(state.easeFactor).toBe(2.5)
    expect(state.dueAt).toBe(now.toISOString())
  })

  it('applies SM-2 style intervals based on ratings', () => {
    const now = new Date('2025-01-01T00:00:00.000Z')
    const initial = createInitialSchedulingState(now)

    const good = scheduleReview(initial, 'good', now)
    expect(good.intervalDays).toBe(1)

    const goodAgain = scheduleReview(good, 'good', new Date('2025-01-02T00:00:00.000Z'))
    expect(goodAgain.intervalDays).toBe(3)

    const easy = scheduleReview(goodAgain, 'easy', new Date('2025-01-05T00:00:00.000Z'))
    expect(easy.intervalDays).toBeGreaterThanOrEqual(4)
    expect(easy.easeFactor).toBeGreaterThan(goodAgain.easeFactor)
  })

  it('resets repetitions on again and never drops ease below minimum', () => {
    const now = new Date('2025-01-01T00:00:00.000Z')
    let state = createInitialSchedulingState(now)

    for (let i = 0; i < 20; i += 1) {
      state = scheduleReview(state, 'again', now)
    }

    expect(state.repetitions).toBe(0)
    expect(state.easeFactor).toBe(1.3)
  })

  it('determines card due status correctly', () => {
    expect(isCardDue('2025-01-01T00:00:00.000Z', new Date('2025-01-02T00:00:00.000Z'))).toBe(true)
    expect(isCardDue('2025-01-03T00:00:00.000Z', new Date('2025-01-02T00:00:00.000Z'))).toBe(false)
  })
})
