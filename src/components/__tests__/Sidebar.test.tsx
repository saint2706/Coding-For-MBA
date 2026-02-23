import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import Sidebar from '../Sidebar'
import { MemoryRouter } from 'react-router-dom'
import * as contentLoader from '../../utils/contentLoader'
import * as reviewTracker from '../../utils/reviewTracker'

// Mock dependencies
vi.mock('../../utils/contentLoader', () => ({
  getAllPhases: vi.fn(),
  getLessonsByPhase: vi.fn(),
  phaseIcons: ['A', 'B'],
}))

// Mock store
const useProgressStoreMock = vi.fn((selector) => selector({ completedLessons: [] }))
vi.mock('../../stores/progressStore', () => ({
  useProgressStore: (selector: any) => useProgressStoreMock(selector),
}))

vi.mock('../../utils/reviewTracker', () => ({
  getReviewDueCountByPhase: vi.fn(),
  getReviewStreak: () => 0,
}))

describe('Sidebar Accessibility', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  const phases = [{ phase: 1, title: 'Phase 1', days: [1, 2, 3] }]
  const lessonsPhase1 = [
    { day: 1, title: 'Lesson 1', phase: 1 },
    { day: 2, title: 'Lesson 2', phase: 1 },
    { day: 3, title: 'Lesson 3', phase: 1 },
  ]

  it('renders accessible progress information', async () => {
    vi.mocked(contentLoader.getAllPhases).mockReturnValue(
      phases as unknown as ReturnType<typeof contentLoader.getAllPhases>,
    )
    vi.mocked(contentLoader.getLessonsByPhase).mockReturnValue(
      lessonsPhase1 as unknown as ReturnType<typeof contentLoader.getLessonsByPhase>,
    )

    // Mock 1 completed lesson (Day 1 -> ID 1)
    useProgressStoreMock.mockImplementation((selector) => selector({ completedLessons: [1] }))

    vi.mocked(reviewTracker.getReviewDueCountByPhase).mockReturnValue({
      1: 5,
    } as unknown as ReturnType<typeof reviewTracker.getReviewDueCountByPhase>) // 5 reviews due

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={() => {}} />
        </MemoryRouter>,
      )
    })

    const toggleButton = container.querySelector('.phase-toggle')
    expect(toggleButton).toBeDefined()

    const progressContainer = toggleButton?.querySelector('.phase-toggle-progress')
    expect(progressContainer).toBeDefined()

    // Check for sr-only description
    const srOnly = progressContainer?.querySelector('.sr-only')
    expect(srOnly).not.toBeNull()
    expect(srOnly?.textContent).toContain('1 of 3')

    // Check that visual parts are hidden
    const visualText = progressContainer?.querySelector('[aria-hidden="true"]')
    expect(visualText).not.toBeNull()

    // Check for arrow SVG
    const arrow = toggleButton?.querySelector('.phase-toggle-arrow svg')
    expect(arrow).not.toBeNull()
    expect(arrow?.getAttribute('aria-hidden')).toBe('true')
  })
})
