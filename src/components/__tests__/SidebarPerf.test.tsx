import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import Sidebar from '../Sidebar'
import { MemoryRouter } from 'react-router-dom'
import * as contentLoader from '../../utils/contentLoader'

// Mock dependencies
vi.mock('../../utils/contentLoader', () => ({
  getAllPhases: vi.fn(),
  getLessonsByPhase: vi.fn(),
  phaseIcons: ['A', 'B'],
}))

vi.mock('../../utils/progressTracker', () => ({
  isLessonComplete: () => false,
  getCompletedForPhase: () => [],
}))

vi.mock('../../utils/reviewTracker', () => ({
  getReviewDueCountByPhase: () => ({}),
  getReviewStreak: () => 0,
}))

describe('Sidebar Performance', () => {
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

  const phases = [
    { phase: 1, title: 'Phase 1', days: [1, 2] },
    { phase: 2, title: 'Phase 2', days: [3, 4] },
  ]
  const lessonsPhase1 = [
    { day: 1, title: 'Lesson 1', phase: 1 },
    { day: 2, title: 'Lesson 2', phase: 1 },
  ]
  const lessonsPhase2 = [
    { day: 3, title: 'Lesson 3', phase: 2 },
    { day: 4, title: 'Lesson 4', phase: 2 },
  ]

  it('does not render lesson links for closed phases', async () => {
    vi.mocked(contentLoader.getAllPhases).mockReturnValue(phases as any)
    vi.mocked(contentLoader.getLessonsByPhase).mockImplementation((phase) => {
      if (phase === 1) return lessonsPhase1 as any
      if (phase === 2) return lessonsPhase2 as any
      return []
    })

    // Render sidebar with no active phase (simulate being on Home)
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={() => {}} />
        </MemoryRouter>
      )
    })

    // Phase toggles should be visible
    expect(container.textContent).toContain('Phase 1: Phase 1')
    expect(container.textContent).toContain('Phase 2: Phase 2')

    // Lesson links should NOT be in the DOM
    const lesson1 = Array.from(container.querySelectorAll('a')).find(el => el.textContent?.includes('Day 1: Lesson 1'))
    expect(lesson1).toBeUndefined()
  })

  it('renders lesson links when phase is opened', async () => {
    vi.mocked(contentLoader.getAllPhases).mockReturnValue(phases as any)
    vi.mocked(contentLoader.getLessonsByPhase).mockImplementation((phase) => {
      if (phase === 1) return lessonsPhase1 as any
      if (phase === 2) return lessonsPhase2 as any
      return []
    })

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={() => {}} />
        </MemoryRouter>
      )
    })

    // Initially lesson 1 is not visible
    let lesson1 = Array.from(container.querySelectorAll('a')).find(el => el.textContent?.includes('Day 1: Lesson 1'))
    expect(lesson1).toBeUndefined()

    // Find and click the toggle for Phase 1
    const buttons = Array.from(container.querySelectorAll('button'))
    const phase1Button = buttons.find(b => b.textContent?.includes('Phase 1: Phase 1'))

    expect(phase1Button).toBeDefined()

    await act(async () => {
      phase1Button?.click()
    })

    // Now lesson 1 should be visible
    lesson1 = Array.from(container.querySelectorAll('a')).find(el => el.textContent?.includes('Day 1: Lesson 1'))
    expect(lesson1).toBeDefined()
    expect(lesson1?.textContent).toContain('Day 1: Lesson 1')
  })
})
