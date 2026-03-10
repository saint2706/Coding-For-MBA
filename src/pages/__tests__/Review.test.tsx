import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import Review from '../Review'
import * as reviewTracker from '../../utils/reviewTracker'
import type { ReviewCard } from '../../utils/reviewTracker'

// Mock dependencies
vi.mock('../../utils/reviewTracker', () => ({
  getDueReviewCards: vi.fn(),
  getReviewStreak: vi.fn(),
  rateReviewCard: vi.fn(),
}))

vi.mock('../../components/SEOHead', () => ({ default: () => null }))
vi.mock('../../components/Breadcrumb', () => ({ default: () => null }))

describe('Review Page', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  const mockCard: ReviewCard = {
    id: 'test-card-1',
    state: {
      repetitions: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      dueAt: new Date().toISOString(),
      lastReviewedAt: null,
    },
    day: 1,
    phase: 1,
    lessonTitle: 'Test Lesson',
    sourceType: 'concept',
    prompt: 'What is a variable?',
    answer: 'A container for storing data values.',
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()

    // Default mocks
    vi.mocked(reviewTracker.getDueReviewCards).mockReturnValue([mockCard])
    vi.mocked(reviewTracker.getReviewStreak).mockReturnValue(5)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('renders a due card', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Review />
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain(mockCard.prompt)
    expect(container.textContent).toContain('Show Answer')
  })

  it('reveals answer on button click', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Review />
        </MemoryRouter>,
      )
    })

    const showButton = container.querySelector('.review-answer-btn') as HTMLButtonElement
    await act(async () => {
      showButton.click()
    })

    expect(container.textContent).toContain(mockCard.answer)
    expect(container.querySelectorAll('.review-action-btn')).toHaveLength(4)
  })

  it('reveals answer on Space key', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Review />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true }))
    })

    expect(container.textContent).toContain(mockCard.answer)
  })

  it('reveals answer on Enter key', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Review />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    expect(container.textContent).toContain(mockCard.answer)
  })

  it('rates card on number keys after reveal', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Review />
        </MemoryRouter>,
      )
    })

    // Reveal first
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    // Press '3' for Good
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }))
    })

    expect(reviewTracker.rateReviewCard).toHaveBeenCalledWith(mockCard.id, 'good', expect.any(Date))
  })

  it('does not rate card before reveal', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Review />
        </MemoryRouter>,
      )
    })

    // Press '3' for Good (should be ignored)
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }))
    })

    expect(reviewTracker.rateReviewCard).not.toHaveBeenCalled()
  })
})
