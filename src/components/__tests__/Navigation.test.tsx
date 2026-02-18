import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '../Sidebar'
import Navbar from '../Navbar'

// Mock dependencies
vi.mock('../../utils/contentLoader', () => ({
  getAllPhases: () => [
    { phase: 1, title: 'Phase 1', days: [1, 2] },
    { phase: 2, title: 'Phase 2', days: [3, 4] },
  ],
  getLessonsByPhase: (phaseNum: number) => {
    if (phaseNum === 1) {
      return [
        { day: 1, title: 'Lesson 1', phase: 1 },
        { day: 2, title: 'Lesson 2', phase: 1 },
      ]
    }
    return []
  },
  phaseIcons: ['🐍', '🔧'],
}))

vi.mock('../../utils/progressTracker', () => ({
  isLessonComplete: () => false,
  getCompletedForPhase: () => [],
}))

vi.mock('../../utils/reviewTracker', () => ({
  getReviewDueCountByPhase: () => ({ 1: 0, 2: 0 }),
  getReviewStreak: () => 0,
}))

vi.mock('../context/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}))

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

describe('Navigation Accessibility', () => {
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

  it('Sidebar renders correctly and should highlight the active link with aria-current="page"', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/curriculum']}>
          <Sidebar isOpen={true} onClose={() => {}} />
        </MemoryRouter>
      )
    })

    // Check if "Full Curriculum" link is active
    // We need to query the DOM inside the container
    const links = Array.from(container.querySelectorAll('a'))
    const curriculumLink = links.find(l => l.textContent?.includes('Full Curriculum'))

    expect(curriculumLink).not.toBeUndefined()
    expect(curriculumLink?.className).toContain('active')

    // Check if it has aria-current="page"
    // This assertion is expected to fail initially
    expect(curriculumLink?.getAttribute('aria-current')).toBe('page')
  })

  it('Sidebar renders active lesson link with aria-current="page"', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/lesson/1']}>
          <Sidebar isOpen={true} onClose={() => {}} />
        </MemoryRouter>
      )
    })

    // Wait for effects to run (e.g. timeout in Sidebar)
    await new Promise(resolve => setTimeout(resolve, 150))

    const links = Array.from(container.querySelectorAll('a'))
    const lessonLink = links.find(l => l.textContent?.includes('Day 1: Lesson 1'))

    expect(lessonLink).not.toBeUndefined()
    expect(lessonLink?.className).toContain('active')

    // Check if it has aria-current="page"
    expect(lessonLink?.getAttribute('aria-current')).toBe('page')
  })

  it('Navbar renders correctly and highlights the active link with aria-current="page"', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/curriculum']}>
          <Navbar onToggleSidebar={() => {}} />
        </MemoryRouter>
      )
    })

    const links = Array.from(container.querySelectorAll('a'))
    // Find link with text "Curriculum"
    const curriculumLink = links.find(l => l.textContent === 'Curriculum')

    expect(curriculumLink).not.toBeUndefined()
    expect(curriculumLink?.className).toContain('active')
    expect(curriculumLink?.getAttribute('aria-current')).toBe('page')
  })
})
