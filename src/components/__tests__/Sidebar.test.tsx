import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import Sidebar from '../Sidebar'
import { MemoryRouter } from 'react-router-dom'
import * as contentLoader from '../../utils/contentLoader'
import * as reviewTracker from '../../utils/reviewTracker'

// Mock dependencies
vi.mock('../../utils/contentLoader', async () => {
  const actual = await vi.importActual('../../utils/contentLoader')
  return {
    ...actual as any,
    getAllPhases: vi.fn(),
    getLessonsByPhase: vi.fn(),
    phaseIcons: ['A', 'B'],
  }
})

// Mock store
const useProgressStoreMock = vi.fn((selector) => selector({ completedLessons: [] }))
vi.mock('../../stores/progressStore', () => ({
  useProgressStore: (selector: any) => useProgressStoreMock(selector),
}))

vi.mock('../../utils/reviewTracker', () => ({
  getReviewDueCountByPhase: vi.fn(),
  getReviewStreak: () => 0,
}))

describe('Sidebar', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    vi.mocked(contentLoader.getAllPhases).mockReturnValue([
      { phase: 1, title: 'Phase 1', days: ['01', '02'] }
    ] as any)
    vi.mocked(contentLoader.getLessonsByPhase).mockReturnValue([
      { day: '01', title: 'Lesson 1', phase: 1 },
      { day: '02', title: 'Lesson 2', phase: 1 }
    ] as any)
    vi.mocked(reviewTracker.getReviewDueCountByPhase).mockReturnValue({})
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('renders sidebar overlay and aside correctly', () => {
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      )
    })

    const overlay = container.querySelector('.sidebar-overlay')
    expect(overlay?.classList.contains('visible')).toBe(true)

    const aside = container.querySelector('.sidebar')
    expect(aside?.classList.contains('open')).toBe(true)
  })

  it('calls onClose when overlay is clicked', () => {
    const onCloseMock = vi.fn()
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={onCloseMock} />
        </MemoryRouter>
      )
    })

    const overlay = container.querySelector('.sidebar-overlay')
    act(() => {
      overlay?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn()
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={onCloseMock} />
        </MemoryRouter>
      )
    })

    const closeButton = container.querySelector('.sidebar-close')
    act(() => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it('renders accessible progress information', async () => {
    useProgressStoreMock.mockImplementation((selector) => selector({ completedLessons: [1] })) // ID 1 for day '01'

    vi.mocked(reviewTracker.getReviewDueCountByPhase).mockReturnValue({
      1: 5,
    } as any)

    act(() => {
      root?.render(
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
    expect(srOnly?.textContent).toContain('1 of 2')

    // Check that visual parts are hidden
    const visualText = progressContainer?.querySelector('[aria-hidden="true"]')
    expect(visualText).not.toBeNull()
  })
})
