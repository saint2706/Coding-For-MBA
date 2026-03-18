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
      { day: '01', title: 'Lesson 1', phase: 1, content: '', path: '' },
      { day: '02', title: 'Lesson 2', phase: 1, content: '', path: '' },
    ] as unknown as ReadonlyArray<Readonly<contentLoader.Lesson>>)
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
    completedSet: new Set<number>(),
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
    expect(container.textContent).toContain('Phase 1: Foundations')
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
    expect(container.textContent).toContain('Phase Overview')
    expect(container.textContent).toContain('Day 01: Lesson 1')
    expect(container.textContent).toContain('Day 02: Lesson 2')
  })

  it('shows correct completed count and due count', () => {
    act(() => {
      root?.render(
        <MemoryRouter>
          <SidebarPhaseGroup
            {...defaultProps}
            completedSet={new Set([1])} // Day 01
            dueCount={3}
          />
        </MemoryRouter>,
      )
    })

    const progress = container.querySelector('.phase-toggle-progress')
    expect(progress?.textContent).toContain('1/2 · 🧠 3')
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
    expect(activeLinks[0]!.textContent).toContain('Day 01: Lesson 1')
  })
})
