import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import Curriculum from '../Curriculum'
import * as contentLoader from '../../utils/contentLoader'
import { useProgressStore } from '../../stores/progressStore'

vi.mock('../../components/SEOHead', () => ({
  default: () => <div data-testid="seo-head" />,
}))

vi.mock('../../utils/contentLoader', () => ({
  getAllPhases: vi.fn(),
  getCurriculumMetadata: vi.fn(() => ({ totalDays: 0, totalPhases: 0, totalLevels: 0 })),
  getLessonsByPhase: vi.fn(),
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
  },
  phaseIcons: ['📊', '🐍'],
}))

vi.mock('../../stores/progressStore', () => ({
  useProgressStore: vi.fn(),
}))

vi.mock('../../utils/progressTracker', () => ({
  getCompletedCount: vi.fn().mockReturnValue(1),
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
      ...props
    }: Record<string, unknown> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  useReducedMotion: vi.fn().mockReturnValue(true),
  useScroll: vi.fn().mockReturnValue({ scrollYProgress: { get: () => 0 } }),
  useTransform: vi.fn().mockReturnValue(1),
}))

describe('Curriculum', () => {
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

  it('renders the curriculum page correctly with phases and lessons', () => {
    vi.mocked(contentLoader.getCurriculumMetadata).mockReturnValue({
      totalDays: 2,
      totalPhases: 2,
      totalLevels: 2,
    })

    vi.mocked(contentLoader.getAllPhases).mockReturnValue([
      {
        phase: 1,
        title: 'Foundations',
        description: 'desc',
        days: [],
        objectives: [] as string[],
        content: '',
        path: '',
      },
      {
        phase: 2,
        title: 'Data',
        description: 'desc',
        days: [],
        objectives: [] as string[],
        content: '',
        path: '',
      },
    ])

    vi.mocked(contentLoader.getLessonsByPhase).mockImplementation((phase) => {
      if (phase === 1) {
        return [
          { day: '1', title: 'Intro', phase: 1, content: '', path: '' },
        ] as unknown as ReturnType<typeof contentLoader.getLessonsByPhase>
      }
      return [
        { day: '2', title: 'Advanced', phase: 2, content: '', path: '' },
      ] as unknown as ReturnType<typeof contentLoader.getLessonsByPhase>
    })

    vi.mocked(useProgressStore).mockImplementation(((
      selector: (state: { completedLessons: number[] }) => unknown,
    ) => {
      return selector({ completedLessons: [1] }) // numeric id as returned by mock
    }) as unknown as typeof useProgressStore)

    act(() => {
      root!.render(
        <MemoryRouter>
          <Curriculum />
        </MemoryRouter>,
      )
    })

    expect(container?.innerHTML).toContain('Full Curriculum Roadmap')
    expect(container?.innerHTML).toContain('Phase 1: Foundations')
    expect(container?.innerHTML).toContain('Phase 2: Data')
    expect(container?.innerHTML).toContain('Day 1')
    expect(container?.innerHTML).toContain('Intro')
    expect(container?.innerHTML).toContain('Day 2')
    expect(container?.innerHTML).toContain('Advanced')

    // Check for completed icon next to day 1
    const completedPhase1 = container?.innerHTML.includes('✓ Done')
    expect(completedPhase1).toBe(true)
  })
})
