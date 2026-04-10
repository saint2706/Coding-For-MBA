import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import ContentStats from '../ContentStats'
import * as contentLoader from '../../utils/contentLoader'

vi.mock('../../components/SEOHead', () => ({
  default: () => <div data-testid="seo-head" />,
}))

vi.mock('../../components/AnimatedCounter', () => ({
  default: ({
    value,
    suffix,
    format,
  }: {
    value: number
    suffix?: string
    format?: (v: number) => string
  }) => (
    <span data-testid="counter">
      {format ? format(value) : value}
      {suffix || ''}
    </span>
  ),
}))

vi.mock('../../utils/contentLoader', () => ({
  getContentStats: vi.fn(),
  phaseIcons: ['📊', '🐍'],
}))

describe('ContentStats', () => {
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

  it('renders content statistics correctly', () => {
    vi.mocked(contentLoader.getContentStats).mockReturnValue({
      lessonCount: 2,
      phaseCount: 1,
      totalWords: 14,
      totalReadingMins: 7,
      difficultyMap: { beginner: 1, advanced: 1 },
      tagCloud: [
        ['python', 2],
        ['basics', 1],
        ['data', 1],
      ],
      phaseStats: [
        {
          phase: 1,
          title: 'Python Foundations',
          lessonCount: 2,
          totalWords: 14,
          totalReadingTime: 7,
        },
      ],
      topConcepts: [
        ['variables', 2],
        ['types', 1],
        ['loops', 1],
      ],
    })

    act(() => {
      root!.render(
        <MemoryRouter>
          <ContentStats />
        </MemoryRouter>,
      )
    })

    expect(container?.innerHTML).toContain('Content Statistics')

    // Check hero stats (2 lessons, 1 phase, 14 words, 7 mins total reading time -> 0 hours)
    const counters = container?.querySelectorAll('[data-testid="counter"]')
    expect(counters?.length).toBe(4)
    if (counters && counters.length >= 4) {
      expect(counters[0]!.textContent).toBe('2') // lessons
      expect(counters[1]!.textContent).toBe('1') // phases
      expect(counters[2]!.textContent).toBe('14') // words
      expect(counters[3]!.textContent).toBe('0h') // reading time
    }

    // Check difficulty distribution
    expect(container?.innerHTML).toContain('beginner')
    expect(container?.innerHTML).toContain('advanced')

    // Check phase breakdown
    expect(container?.innerHTML).toContain('Phase 1')
    expect(container?.innerHTML).toContain('Python Foundations')

    // Check tag cloud
    expect(container?.innerHTML).toContain('python')
    expect(container?.innerHTML).toContain('basics')
    expect(container?.innerHTML).toContain('data')

    // Check top concepts
    expect(container?.innerHTML).toContain('variables')
    expect(container?.innerHTML).toContain('types')
    expect(container?.innerHTML).toContain('loops')
  })
})
