import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import SidebarPhaseGroup from '../SidebarPhaseGroup'
import * as contentLoader from '../../utils/contentLoader'

// Mock dependencies
vi.mock('../../utils/contentLoader', async () => {
  const actual = await vi.importActual('../../utils/contentLoader')
  return {
    ...(actual as typeof contentLoader),
    getLessonsByPhase: vi.fn(),
    getLesson: vi.fn(),
    phaseIcons: ['📖', '🚀', '🧠'],
  }
})

describe('SidebarPhaseGroup', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    vi.mocked(contentLoader.getLessonsByPhase).mockReturnValue([
      {
        day: '01',
        title: 'Lesson 1',
        phase: 1,
        content: '',
        path: '',
        difficulty: 'beginner',
        tags: [],
        concepts: [],
      },
      {
        day: '02',
        title: 'Lesson 2',
        phase: 1,
        content: '',
        path: '',
        difficulty: 'beginner',
        tags: [],
        concepts: [],
      },
    ])
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  const defaultProps = {
    phase: { phase: 1, title: 'Foundations', days: ['01', '02'], content: '', path: '' },
    isActive: false,
    completedIdsJoined: '',
    dueCount: 0,
    currentPath: '/',
    onToggle: vi.fn(),
    onClose: vi.fn(),
  }

  it('renders a collapsed phase group by default', () => {
    act(() => {
      root?.render(
        <MemoryRouter>
          <SidebarPhaseGroup {...defaultProps} />
        </MemoryRouter>,
      )
    })

    const button = container.querySelector('.phase-toggle')
    expect(button).toBeTruthy()
    expect(button?.getAttribute('aria-expanded')).toBe('false')
    expect(container.textContent).toContain('Foundations')
    expect(container.querySelector('.phase-toggle-num')?.textContent).toBe('01')
    expect(container.textContent).toContain('0/2') // 0 completed out of 2

    // Content should not be visible
    const content = container.querySelector('.phase-days')
    expect(content).toBeNull()
  })

  it('renders an expanded phase group', () => {
    act(() => {
      root?.render(
        <MemoryRouter>
          <SidebarPhaseGroup {...defaultProps} isActive={true} />
        </MemoryRouter>,
      )
    })

    const button = container.querySelector('.phase-toggle')
    expect(button?.getAttribute('aria-expanded')).toBe('true')

    const content = container.querySelector('.phase-days')
    expect(content).toBeTruthy()
    expect(container.textContent).toContain('overview')
    expect(container.textContent).toContain('Lesson 1')
    expect(container.textContent).toContain('Lesson 2')
    // The phase-day links carry their day token explicitly
    const dayLinks = Array.from(container.querySelectorAll('.day-link:not(.day-link--overview)'))
    expect(dayLinks.length).toBe(2)
    expect(dayLinks[0]?.querySelector('.day-link-num')?.textContent).toBe('01')
    expect(dayLinks[1]?.querySelector('.day-link-num')?.textContent).toBe('02')
  })

  it('shows correct completed count and due count', () => {
    act(() => {
      root?.render(
        <MemoryRouter>
          <SidebarPhaseGroup {...defaultProps} completedIdsJoined="1" dueCount={3} />
        </MemoryRouter>,
      )
    })

    const progress = container.querySelector('.phase-toggle-progress')
    expect(progress?.textContent).toContain('1/2')
    expect(progress?.textContent).toContain('3') // due count
  })

  it('calls onToggle when button is clicked', () => {
    const onToggleMock = vi.fn()
    act(() => {
      root?.render(
        <MemoryRouter>
          <SidebarPhaseGroup {...defaultProps} onToggle={onToggleMock} />
        </MemoryRouter>,
      )
    })

    const button = container.querySelector('.phase-toggle')
    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onToggleMock).toHaveBeenCalledWith(1)
  })

  it('marks active link based on currentPath', () => {
    act(() => {
      root?.render(
        <MemoryRouter>
          <SidebarPhaseGroup {...defaultProps} isActive={true} currentPath="/lesson/01" />
        </MemoryRouter>,
      )
    })

    const activeLinks = container.querySelectorAll('.day-link.active')
    expect(activeLinks.length).toBe(1)
    expect(activeLinks[0]?.querySelector('.day-link-num')?.textContent).toBe('01')
    expect(activeLinks[0]?.textContent).toContain('Lesson 1')
  })

  describe('propsAreEqual optimization', () => {
    // We cannot directly import the unnamed `propsAreEqual` function
    // since it's an internal part of the memoized default export,
    // but we can test its behavior by changing props and ensuring re-renders are optimized
    // or by importing the actual component and testing rendering behavior.
    // However, since React.memo wrapper is the default export, we will test the logic directly
    // by mocking a re-render. To ensure branch coverage, we will trigger renders with specific prop combinations.

    it('re-renders when isActive changes', () => {
      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} isActive={false} />
          </MemoryRouter>,
        )
      })

      const beforeExpanded = container.querySelector('.phase-toggle')?.getAttribute('aria-expanded')

      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} isActive={true} />
          </MemoryRouter>,
        )
      })

      const afterExpanded = container.querySelector('.phase-toggle')?.getAttribute('aria-expanded')
      expect(beforeExpanded).toBe('false')
      expect(afterExpanded).toBe('true')
    })

    it('re-renders when dueCount changes', () => {
      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} dueCount={0} />
          </MemoryRouter>,
        )
      })

      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} dueCount={1} />
          </MemoryRouter>,
        )
      })

      const progress = container.querySelector('.phase-toggle-progress')
      expect(progress?.textContent).toContain('0/2')
      expect(progress?.textContent).toContain('1') // due count
    })

    it('re-renders when phase changes', () => {
      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup
              {...defaultProps}
              phase={{ ...defaultProps.phase, phase: 2, title: 'Phase 2' }}
            />
          </MemoryRouter>,
        )
      })

      expect(container.querySelector('.phase-toggle-num')?.textContent).toBe('02')
      expect(container.textContent).toContain('Phase 2')
    })

    it('re-renders when completedIdsJoined changes for lessons in this phase', () => {
      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} completedIdsJoined="" isActive={true} />
          </MemoryRouter>,
        )
      })

      expect(container.querySelectorAll('.day-link-prefix.completed').length).toBe(0)

      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} completedIdsJoined="1" isActive={true} />
          </MemoryRouter>,
        )
      })

      expect(container.querySelectorAll('.day-link-prefix.completed').length).toBe(1)
    })

    it('handles currentPath changes correctly', () => {
      // Mock getLesson to return phase 1 for "01" and phase 2 for "03"
      vi.mocked(contentLoader.getLesson).mockImplementation((day: string | number) => {
        if (day === '01')
          return { phase: 1 } as unknown as ReturnType<typeof contentLoader.getLesson>
        if (day === '03')
          return { phase: 2 } as unknown as ReturnType<typeof contentLoader.getLesson>
        return undefined
      })

      // Initial render with path outside the phase
      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} currentPath="/lesson/03" isActive={true} />
          </MemoryRouter>,
        )
      })

      expect(container.querySelector('.day-link.active')).toBeNull()

      // Change to a path inside the phase
      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} currentPath="/lesson/01" isActive={true} />
          </MemoryRouter>,
        )
      })

      expect(
        container.querySelector('.day-link.active')?.querySelector('.day-link-num')?.textContent,
      ).toBe('01')

      // Change to phase overview inside the phase
      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} currentPath="/phase/1" isActive={true} />
          </MemoryRouter>,
        )
      })

      expect(container.querySelector('.day-link.active')?.textContent).toContain('overview')

      // Change path to another lesson outside the phase (should not trigger active class)
      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} currentPath="/lesson/03" isActive={true} />
          </MemoryRouter>,
        )
      })

      expect(container.querySelector('.day-link.active')).toBeNull()

      // Test the `isRelevantPath` edge case for a null getLesson result
      vi.mocked(contentLoader.getLesson).mockReturnValue(undefined)
      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} currentPath="/lesson/unknown" isActive={true} />
          </MemoryRouter>,
        )
      })

      expect(container.querySelector('.day-link.active')).toBeNull()

      // To cover the branch where the old path is NOT relevant but the new path IS relevant
      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} currentPath="/lesson/01" isActive={true} />
          </MemoryRouter>,
        )
      })

      // To cover when both paths are NOT relevant
      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup
              {...defaultProps}
              currentPath="/something-unrelated"
              isActive={true}
            />
          </MemoryRouter>,
        )
      })

      // To cover when path doesn't start with /lesson/
      act(() => {
        root?.render(
          <MemoryRouter>
            <SidebarPhaseGroup {...defaultProps} currentPath="/phase/2" isActive={true} />
          </MemoryRouter>,
        )
      })
    })
  })
})
