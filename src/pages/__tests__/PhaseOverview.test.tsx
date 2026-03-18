import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PhaseOverview from '../PhaseOverview'
import * as contentLoader from '../../utils/contentLoader'
import { useProgressStore } from '../../stores/progressStore'

vi.mock('../../components/SEOHead', () => ({
  default: () => <div data-testid="seo-head" />,
}))

vi.mock('../../components/MarkdownRenderer', () => ({
  default: ({ content }: { content: string }) => <div data-testid="markdown">{content}</div>,
}))

vi.mock('../../utils/contentLoader', () => ({
  getPhase: vi.fn(),
  getLessonsByPhase: vi.fn(),
  getNotebook: vi.fn(),
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
  },
  phaseIcons: ['📊', '🐍'],
}))

vi.mock('../../stores/progressStore', () => ({
  useProgressStore: vi.fn(),
}))

vi.mock('../../utils/dayToken', () => ({
  dayTokenToProgressId: vi.fn((day) => parseInt(day)),
}))

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      whileInView,
      initial,
      viewport,
      variants,
      transition,
      layoutId,
      ...props
    }: any) => <div {...props}>{children}</div>,
  },
  useReducedMotion: vi.fn().mockReturnValue(true),
}))

describe('PhaseOverview', () => {
  let container: HTMLDivElement | null = null
  let root: any = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
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
    vi.mocked(useProgressStore).mockImplementation((selector: any) =>
      selector({ completedLessons: [] }),
    )

    act(() => {
      root.render(
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

    vi.mocked(useProgressStore).mockImplementation((selector: any) =>
      selector({ completedLessons: [1] }),
    )

    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/phase/1']}>
          <Routes>
            <Route path="/phase/:phaseNum" element={<PhaseOverview />} />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(container?.innerHTML).toContain('Phase 1: Python Foundations')
    expect(container?.innerHTML).toContain('Beginner')
    expect(container?.innerHTML).toContain('2 hours')
    expect(container?.innerHTML).toContain('Intro to Python')
    expect(container?.innerHTML).toContain('Variables')
    expect(container?.innerHTML).toContain('Phase 1 markdown content')

    // Check for solutions notebook link
    expect(container?.innerHTML).toContain('Solutions Notebook')
    expect(container?.innerHTML).toContain('View Phase 1 Solutions')

    // Check for completed icon next to day 1
    const completedPhase1 = container?.innerHTML.includes('✓')
    expect(completedPhase1).toBe(true)
  })
})
