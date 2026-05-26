import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ContentStats from '../ContentStats'

// Mock AnimatedCounter to simplify testing
vi.mock('../../components/AnimatedCounter', () => ({
  default: ({ value, format, suffix }: any) => {
    let displayValue = value
    if (format) displayValue = format(value)
    if (suffix) displayValue = `${displayValue}${suffix}`
    return <span data-testid="mock-counter">{displayValue}</span>
  }
}))

// Mock SEOHead
vi.mock('../../components/SEOHead', () => ({
  default: () => <div data-testid="mock-seo-head" />
}))

// Mock contentLoader
vi.mock('../../utils/contentLoader', () => ({
  phaseIcons: ['1️⃣', '2️⃣'],
  getContentStats: vi.fn(() => ({
    lessonCount: 42,
    phaseCount: 2,
    totalWords: 15000,
    totalReadingMins: 120, // 2 hours
    difficultyMap: {
      beginner: 20,
      intermediate: 15,
      advanced: 7
    },
    phaseStats: [
      {
        phase: 1,
        title: 'Phase One',
        lessonCount: 20,
        totalWords: 5000,
        totalReadingTime: 40
      },
      {
        phase: 2,
        title: 'Phase Two',
        lessonCount: 22,
        totalWords: 10000,
        totalReadingTime: 80
      }
    ],
    tagCloud: [
      ['react', 10],
      ['typescript', 5]
    ],
    topConcepts: [
      ['components', 8],
      ['hooks', 6]
    ]
  }))
}))

describe('ContentStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders content stats successfully', () => {
    render(
      <MemoryRouter>
        <ContentStats />
      </MemoryRouter>
    )

    // Check header
    expect(screen.getByText('Content Statistics')).toBeDefined()
    expect(screen.getByTestId('mock-seo-head')).toBeDefined()

    // Check counters
    const counters = screen.getAllByTestId('mock-counter')
    expect(counters).toHaveLength(4)
    expect(counters[0]?.textContent).toBe('42') // lessons
    expect(counters[1]?.textContent).toBe('2') // phases
    expect(counters[2]?.textContent).toBe('15,000') // words
    expect(counters[3]?.textContent).toBe('2h') // reading time

    // Check difficulty distribution
    expect(screen.getByText('beginner')).toBeDefined()
    expect(screen.getByText('20')).toBeDefined()
    expect(screen.getByText('intermediate')).toBeDefined()
    expect(screen.getByText('15')).toBeDefined()
    expect(screen.getByText('advanced')).toBeDefined()
    expect(screen.getByText('7')).toBeDefined()

    // Check phase breakdown
    expect(screen.getByText('Phase 1')).toBeDefined()
    expect(screen.getByText('Phase One')).toBeDefined()
    expect(screen.getByText('Phase 2')).toBeDefined()
    expect(screen.getByText('Phase Two')).toBeDefined()

    // Check tags
    expect(screen.getByText('react')).toBeDefined()
    expect(screen.getByText('10')).toBeDefined()
    expect(screen.getByText('typescript')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()

    // Check concepts
    expect(screen.getByText('components')).toBeDefined()
    expect(screen.getByText('8')).toBeDefined()
    expect(screen.getByText('hooks')).toBeDefined()
    expect(screen.getByText('6')).toBeDefined()
  })

  it('handles empty tag cloud gracefully', async () => {
    const { getContentStats } = await import('../../utils/contentLoader')
    vi.mocked(getContentStats).mockReturnValueOnce({
      lessonCount: 0,
      phaseCount: 0,
      totalWords: 0,
      totalReadingMins: 0,
      difficultyMap: {},
      phaseStats: [],
      tagCloud: [],
      topConcepts: []
    })

    render(
      <MemoryRouter>
        <ContentStats />
      </MemoryRouter>
    )

    expect(screen.getByText('Content Statistics')).toBeDefined()
  })
})
