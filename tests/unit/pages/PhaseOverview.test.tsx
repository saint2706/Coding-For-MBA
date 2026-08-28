import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PhaseOverview from '../../../src/pages/PhaseOverview'
import * as contentLoader from '../../../src/utils/contentLoader'
import { useProgressStore } from '../../../src/stores/progressStore'

vi.mock('../../../src/components/SEOHead', () => ({
  default: () => <div data-testid="seo-head" />,
}))

vi.mock('../../../src/components/MarkdownRenderer', () => ({
  default: ({ content }: { content: string }) => <div data-testid="markdown">{content}</div>,
}))

vi.mock('../../../src/utils/contentLoader', () => ({
  getPhase: vi.fn(),
  getLessonsByPhase: vi.fn(),
  getNotebook: vi.fn(),
  getCurriculumMetadata: vi.fn(() => ({ totalDays: 163, totalPhases: 12, totalLevels: 4 })),
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
  },
  phaseIcons: ['ChartBar', 'Code'],
}))

vi.mock('../../../src/stores/progressStore', () => ({
  useProgressStore: vi.fn(),
}))

vi.mock('../../../src/utils/dayToken', () => ({
  dayTokenToProgressId: vi.fn((day) => parseInt(day)),
}))

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      whileInView: _whileInView,
      initial: _initial,
      viewport: _viewport,
      variants: _variants,
      transition: _transition,
      layoutId: _layoutId,
      ...props
    }: React.ComponentProps<'div'> & {
      whileInView?: unknown
      initial?: unknown
      viewport?: unknown
      variants?: unknown
      transition?: unknown
      layoutId?: unknown
    }) => <div {...props}>{children}</div>,
  },
  useReducedMotion: vi.fn().mockReturnValue(true),
}))

describe('PhaseOverview', () => {
  let container: HTMLDivElement | null = null
  let root: ReturnType<typeof createRoot> | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root!.unmount()
    })
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    container = null
    vi.clearAllMocks()
  })

  it('renders phase not found when phase does not exist', () => {
    vi.mocked(contentLoader.getPhase).mockReturnValue(undefined)
    vi.mocked(contentLoader.getLessonsByPhase).mockReturnValue([])
    vi.mocked(useProgressStore).mockImplementation((selector) =>
      selector({ completedLessons: [] } as unknown as ReturnType<typeof useProgressStore.getState>),
    )

    act(() => {
      root!.render(
        <MemoryRouter initialEntries={['/phase/99']}>
          <Routes>
            <Route path="/phase/:phaseNum" element={<PhaseOverview />} />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(container?.innerHTML).toContain('Phase not found')
    expect(container?.innerHTML).toContain("Phase 99 doesn't exist")
  })

  it('renders phase details correctly', () => {
    vi.mocked(contentLoader.getPhase).mockReturnValue({
      phase: 1,
      title: 'Python Foundations',
      description: 'Learn Python basics.',
      difficulty: 'beginner',
      totalDuration: 120, // 2 hours
      content: 'Phase 1 markdown content',
      path: '',
    })

    vi.mocked(contentLoader.getLessonsByPhase).mockReturnValue([
      {
        day: '1',
        title: 'Intro to Python',
        duration: 15,
        phase: 1,
        content: '',
        path: '',
      } as unknown as ReturnType<typeof contentLoader.getLessonsByPhase>[number],
      {
        day: '2',
        title: 'Variables',
        duration: 20,
        phase: 1,
        content: '',
        path: '',
      } as unknown as ReturnType<typeof contentLoader.getLessonsByPhase>[number],
    ])

    vi.mocked(contentLoader.getNotebook).mockReturnValue({
      phase: 1,
      cells: [{ cell_type: 'code', source: ['print(1)'] }],
    })

    vi.mocked(useProgressStore).mockImplementation((selector) =>
      selector({ completedLessons: [1] } as unknown as ReturnType<
        typeof useProgressStore.getState
      >),
    )

    act(() => {
      root!.render(
        <MemoryRouter initialEntries={['/phase/1']}>
          <Routes>
            <Route path="/phase/:phaseNum" element={<PhaseOverview />} />
          </Routes>
        </MemoryRouter>,
      )
    })

    // Phase title is rendered in the spread; the numeral is separate.
    expect(container?.querySelector('.phase-spread-numeral')?.textContent).toBe('01')
    expect(container?.querySelector('.phase-spread-title')?.textContent).toContain(
      'Python Foundations',
    )
    expect(container?.innerHTML).toContain('Beginner')
    expect(container?.innerHTML).toContain('Intro to Python')
    expect(container?.innerHTML).toContain('Variables')
    expect(container?.innerHTML).toContain('Phase 1 markdown content')

    // Check for solutions notebook link
    expect(container?.innerHTML).toContain('Notebook')
    expect(container?.innerHTML).toContain('Open Phase 1 solutions')

    // Check for completed icon next to day 1
    const completedPhase1 = container?.innerHTML.includes('✓')
    expect(completedPhase1).toBe(true)
  })
})
