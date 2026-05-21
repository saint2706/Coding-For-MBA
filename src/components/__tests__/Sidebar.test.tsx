import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import Sidebar from '../Sidebar'
import { MemoryRouter } from 'react-router-dom'

import * as contentLoader from '../../utils/contentLoader'
import * as reviewTracker from '../../utils/reviewTracker'

// Mock dependencies
vi.mock('../../utils/contentLoader', async () => {
  const actual = await vi.importActual<typeof import('../../utils/contentLoader')>(
    '../../utils/contentLoader',
  )
  return {
    ...actual,
    getAllPhases: vi.fn(),
    getLessonsByPhase: vi.fn(),
    phaseIcons: ['A', 'B'],
  }
})

// Mock store
const useProgressStoreMock = vi.fn((selector) =>
  selector({ completedLessonsSet: new Set([]) } as unknown as ReturnType<
    typeof import('../../stores/progressStore').useProgressStore.getState
  >),
)
vi.mock('../../stores/progressStore', () => ({
  useProgressStore: (selector: (state: unknown) => unknown) => useProgressStoreMock(selector),
}))

vi.mock('../../utils/dayToken', () => ({
  normalizeDayToken: vi.fn((token) => token),
  dayTokenToProgressId: vi.fn((token) => token),
}))

vi.mock('../../utils/reviewTracker', () => ({
  getReviewDueCountByPhase: vi.fn(),
  getReviewStreak: vi.fn(() => 0),
}))

describe('Sidebar', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    vi.mocked(contentLoader.getAllPhases).mockReturnValue([
      { phase: 1, title: 'Phase 1', days: ['01', '02'] },
    ] as unknown as ReturnType<typeof contentLoader.getAllPhases>)
    vi.mocked(contentLoader.getLessonsByPhase).mockReturnValue([
      { day: '01', title: 'Lesson 1', phase: 1 },
      { day: '02', title: 'Lesson 2', phase: 1 },
    ] as unknown as ReturnType<typeof contentLoader.getLessonsByPhase>)
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
        </MemoryRouter>,
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
        </MemoryRouter>,
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
        </MemoryRouter>,
      )
    })

    const closeButton = container.querySelector('.sidebar-close')
    act(() => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it('renders accessible progress information', async () => {
    useProgressStoreMock.mockImplementation((selector) => selector({ completedLessonsSet: new Set(['01']) })) // ID '01' for day '01' because we mocked dayTokenToProgressId to return token

    vi.mocked(reviewTracker.getReviewDueCountByPhase).mockReturnValue({
      1: 5,
    } as unknown as Record<number, number>)

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

  it('opens phase automatically based on /lesson/:day route', () => {
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/lesson/01']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      )
    })

    const toggleBtn = container.querySelector('.phase-toggle.active')
    expect(toggleBtn).not.toBeNull()
    expect(toggleBtn?.textContent).toContain('Phase 1')
  })

  it('opens phase automatically based on /phase/:num route', () => {
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/phase/1']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      )
    })

    const toggleBtn = container.querySelector('.phase-toggle.active')
    expect(toggleBtn).not.toBeNull()
    expect(toggleBtn?.textContent).toContain('Phase 1')
  })

  it('allows manual toggling of phase', () => {
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      )
    })

    let activeBtn = container.querySelector('.phase-toggle.active')
    expect(activeBtn).toBeNull()

    const phaseBtn = container.querySelector('.phase-toggle') as HTMLButtonElement

    act(() => {
      phaseBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    activeBtn = container.querySelector('.phase-toggle.active')
    expect(activeBtn).not.toBeNull()

    act(() => {
      phaseBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    activeBtn = container.querySelector('.phase-toggle.active')
    expect(activeBtn).toBeNull()
  })

  it('shows the streak count inside the review tree item when streak is > 0', () => {
    vi.mocked(reviewTracker.getReviewStreak).mockReturnValueOnce(5)

    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      )
    })

    const reviewLink = container.querySelector('a[href="/review"]')
    expect(reviewLink).not.toBeNull()
    expect(reviewLink?.textContent).toContain('5d')
  })

  it('scrolls active link into view', () => {
    vi.useFakeTimers()
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView
    const scrollIntoViewMock = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

    try {
      act(() => {
        root?.render(
          <MemoryRouter initialEntries={['/']}>
            <Sidebar isOpen={true} onClose={vi.fn()} />
          </MemoryRouter>,
        )
      })

      act(() => {
        vi.advanceTimersByTime(150)
      })

      expect(scrollIntoViewMock).toHaveBeenCalled()
    } finally {
      window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView
      vi.useRealTimers()
    }
  })

  it('handles rendering with isOpen=false', () => {
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={false} onClose={vi.fn()} />
        </MemoryRouter>,
      )
    })

    const overlay = container.querySelector('.sidebar-overlay')
    expect(overlay?.classList.contains('visible')).toBe(false)

    const aside = container.querySelector('.sidebar')
    expect(aside?.classList.contains('open')).toBe(false)
  })

  it('renders all static navigation links properly', () => {
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/curriculum']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      )
    })

    const links = Array.from(container.querySelectorAll('.tree-item'))
    const hrefs = links.map((l) => l.getAttribute('href'))

    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/curriculum')
    expect(hrefs).toContain('/progress')
    expect(hrefs).toContain('/exercises')
    expect(hrefs).toContain('/case-studies')
    expect(hrefs).toContain('/review')

    // The active link should be curriculum
    const activeLink = container.querySelector('.tree-item.active')
    expect(activeLink?.getAttribute('href')).toBe('/curriculum')
  })

  it('covers remaining static navigation links /progress /exercises /case-studies /review', () => {
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/progress']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      )
    })
    let activeLink = container.querySelector('.tree-item.active')
    expect(activeLink?.getAttribute('href')).toBe('/progress')

    act(() => {
      root?.unmount()
      root = createRoot(container)
    })
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/exercises']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      )
    })
    activeLink = container.querySelector('.tree-item.active')
    expect(activeLink?.getAttribute('href')).toBe('/exercises')

    act(() => {
      root?.unmount()
      root = createRoot(container)
    })
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/case-studies']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      )
    })
    activeLink = container.querySelector('.tree-item.active')
    expect(activeLink?.getAttribute('href')).toBe('/case-studies')

    act(() => {
      root?.unmount()
      root = createRoot(container)
    })
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/review']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      )
    })
    activeLink = container.querySelector('.tree-item.active')
    expect(activeLink?.getAttribute('href')).toBe('/review')
  })

  it('calls onClose when navigation links are clicked', () => {
    const onCloseMock = vi.fn()
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={onCloseMock} />
        </MemoryRouter>,
      )
    })

    const homeLink = container.querySelector('a[href="/"]') as HTMLAnchorElement
    act(() => {
      homeLink?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onCloseMock).toHaveBeenCalled()
  })
})
