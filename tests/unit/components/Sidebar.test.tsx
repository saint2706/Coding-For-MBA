import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import Sidebar from '../../../src/components/Sidebar'
import { MemoryRouter, useNavigate } from 'react-router-dom'

import * as contentLoader from '../../../src/utils/contentLoader'
import * as reviewTracker from '../../../src/utils/reviewTracker'
import * as dayToken from '../../../src/utils/dayToken'

// Mock dependencies
vi.mock('../../../src/utils/contentLoader', async () => {
  const actual = await vi.importActual<typeof import('../../../src/utils/contentLoader')>(
    '../../../src/utils/contentLoader',
  )
  return {
    ...actual,
    getAllPhases: vi.fn(),
    getLessonsByPhase: vi.fn(),
    getLesson: vi.fn(),
    getCurriculumMetadata: vi.fn(() => ({ totalDays: 163, totalPhases: 12, totalLevels: 4 })),
    phaseIcons: ['A', 'B'],
  }
})

// Mock store
const useProgressStoreMock = vi.fn((selector) =>
  selector({ completedLessons: [] } as unknown as ReturnType<
    typeof import('../../../src/stores/progressStore').useProgressStore.getState
  >),
)
vi.mock('../../../src/stores/progressStore', () => ({
  useProgressStore: (selector: (state: unknown) => unknown) => useProgressStoreMock(selector),
}))

const useLearningAnalyticsStoreMock = vi.fn((selector) =>
  selector({ timeByLessonDay: {} } as unknown as ReturnType<
    typeof import('../../../src/stores/learningAnalyticsStore').useLearningAnalyticsStore.getState
  >),
)
vi.mock('../../../src/stores/learningAnalyticsStore', () => ({
  useLearningAnalyticsStore: (selector: (state: unknown) => unknown) =>
    useLearningAnalyticsStoreMock(selector),
}))

vi.mock('../../../src/utils/dayToken', () => ({
  normalizeDayToken: vi.fn((token) => token),
  dayTokenToProgressId: vi.fn((token) => token),
}))

vi.mock('../../../src/utils/reviewTracker', () => ({
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
    useProgressStoreMock.mockImplementation((selector) => selector({ completedLessons: ['01'] })) // ID '01' for day '01' because we mocked dayTokenToProgressId to return token

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

  it('marks a started, non-completed lesson as in-progress using tracked time', () => {
    vi.mocked(dayToken.dayTokenToProgressId).mockImplementation((token) => Number(token))
    useProgressStoreMock.mockImplementation((selector) => selector({ completedLessons: [1] }))
    useLearningAnalyticsStoreMock.mockImplementation((selector) =>
      selector({ timeByLessonDay: { 2: 5000 } }),
    )

    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/phase/1']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      )
    })

    const dayLinks = Array.from(container.querySelectorAll('.day-link:not(.day-link--overview)'))
    expect(dayLinks[0]?.querySelector('.day-link-prefix')?.classList.contains('completed')).toBe(
      true,
    )
    expect(dayLinks[1]?.querySelector('.day-link-prefix')?.classList.contains('in-progress')).toBe(
      true,
    )
  })

  it('collapses a finished phase and an untouched phase, but expands a started-but-incomplete phase', () => {
    vi.mocked(dayToken.dayTokenToProgressId).mockImplementation((token) => Number(token))
    vi.mocked(contentLoader.getAllPhases).mockReturnValue([
      { phase: 1, title: 'Phase 1', days: ['01', '02'] },
      { phase: 2, title: 'Phase 2', days: ['03', '04'] },
      { phase: 3, title: 'Phase 3', days: ['05', '06'] },
    ] as unknown as ReturnType<typeof contentLoader.getAllPhases>)
    vi.mocked(contentLoader.getLessonsByPhase).mockImplementation((phaseNum) => {
      const byPhase: Record<number, Array<{ day: string; title: string; phase: number }>> = {
        1: [
          { day: '01', title: 'Lesson 1', phase: 1 },
          { day: '02', title: 'Lesson 2', phase: 1 },
        ],
        2: [
          { day: '03', title: 'Lesson 3', phase: 2 },
          { day: '04', title: 'Lesson 4', phase: 2 },
        ],
        3: [
          { day: '05', title: 'Lesson 5', phase: 3 },
          { day: '06', title: 'Lesson 6', phase: 3 },
        ],
      }
      return (byPhase[Number(phaseNum)] ?? []) as unknown as ReturnType<
        typeof contentLoader.getLessonsByPhase
      >
    })
    // Phase 1: fully complete. Phase 2: untouched. Phase 3: started but incomplete.
    useProgressStoreMock.mockImplementation((selector) => selector({ completedLessons: [1, 2, 5] }))

    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      )
    })

    const toggles = Array.from(container.querySelectorAll('.phase-toggle'))
    expect(toggles[0]?.getAttribute('aria-expanded')).toBe('false')
    expect(toggles[1]?.getAttribute('aria-expanded')).toBe('false')
    expect(toggles[2]?.getAttribute('aria-expanded')).toBe('true')
  })

  it('lets the current route win even after a different phase was manually opened', () => {
    vi.mocked(dayToken.dayTokenToProgressId).mockImplementation((token) => Number(token))
    vi.mocked(dayToken.normalizeDayToken).mockImplementation((token) => token as string)
    vi.mocked(contentLoader.getAllPhases).mockReturnValue([
      { phase: 1, title: 'Phase 1', days: ['01', '02'] },
      { phase: 2, title: 'Phase 2', days: ['03', '04'] },
    ] as unknown as ReturnType<typeof contentLoader.getAllPhases>)
    vi.mocked(contentLoader.getLessonsByPhase).mockImplementation(
      (phaseNum) =>
        (phaseNum === 1
          ? [
              { day: '01', title: 'Lesson 1', phase: 1 },
              { day: '02', title: 'Lesson 2', phase: 1 },
            ]
          : [
              { day: '03', title: 'Lesson 3', phase: 2 },
              { day: '04', title: 'Lesson 4', phase: 2 },
            ]) as unknown as ReturnType<typeof contentLoader.getLessonsByPhase>,
    )
    useProgressStoreMock.mockImplementation((selector) => selector({ completedLessons: [1, 2] }))
    vi.mocked(contentLoader.getLesson).mockImplementation((day) =>
      day === '03'
        ? ({ phase: 2 } as unknown as ReturnType<typeof contentLoader.getLesson>)
        : undefined,
    )

    function Harness() {
      const navigate = useNavigate()
      return (
        <>
          <button type="button" data-testid="go" onClick={() => navigate('/lesson/03')}>
            go
          </button>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </>
      )
    }

    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/']}>
          <Harness />
        </MemoryRouter>,
      )
    })

    // Manually open phase 1 (complete, collapsed by default).
    const phase1Toggle = container.querySelectorAll('.phase-toggle')[0] as HTMLButtonElement
    act(() => {
      phase1Toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(phase1Toggle.getAttribute('aria-expanded')).toBe('true')

    // Navigate to a lesson in phase 2 without unmounting — the route must win.
    act(() => {
      container
        .querySelector('[data-testid="go"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const toggles = Array.from(container.querySelectorAll('.phase-toggle'))
    expect(toggles[1]?.getAttribute('aria-expanded')).toBe('true')
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
