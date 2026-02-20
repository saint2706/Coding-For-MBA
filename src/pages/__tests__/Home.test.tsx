import { afterEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import Home from '../Home'

const { mockGetLastVisited, mockGetCompletedCount } = vi.hoisted(() => ({
  mockGetLastVisited: vi.fn(),
  mockGetCompletedCount: vi.fn(() => 0),
}))

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('motion/react', () => ({
  motion: {
    section: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <section {...props}>{children}</section>
    ),
  },
  useReducedMotion: () => true,
  useScroll: () => ({ scrollYProgress: 0 }),
  useTransform: () => 0,
}))

vi.mock('../../utils/seoSchemas', () => ({
  buildWebSiteSchema: () => ({}),
  buildCourseSchema: () => ({}),
}))

vi.mock('../../components/SEOHead', () => ({ default: () => null }))
vi.mock('../../components/AnimatedCounter', () => ({
  default: ({ value }: { value: number }) => <>{value}</>,
}))
vi.mock('../../components/ProgressBar', () => ({ default: () => null }))

vi.mock('../../utils/progressTracker', () => ({
  getLastVisited: mockGetLastVisited,
  getCompletedCount: mockGetCompletedCount,
  getCompletedForPhase: () => [],
}))

vi.mock('../../utils/contentLoader', () => ({
  getAllPhases: () => [
    {
      phase: 2,
      title: 'Data Foundations',
      totalDuration: 120,
      difficulty: 'beginner',
    },
  ],
  getLessonsByPhase: () => [{ day: 12 }],
  getLesson: (day: number) =>
    day === 12
      ? {
          day: 12,
          title: 'SQL Basics',
          phase: 2,
        }
      : null,
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
  },
  phaseIcons: ['📘'],
}))

describe('Home continue banner', () => {
  let container: HTMLDivElement | null = null
  let root: Root | null = null

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root!.unmount()
      })
    }
    if (container) {
      document.body.removeChild(container)
    }
    vi.clearAllMocks()
  })

  it('renders resume banner when a last visited lesson exists', async () => {
    mockGetLastVisited.mockReturnValue(12)

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    const mountedRoot = root

    await act(async () => {
      mountedRoot.render(<Home />)
    })

    expect(container.textContent).toContain('Continue learning')
    expect(container.textContent).toContain('SQL Basics')
    expect(container.textContent).toContain('Phase 2: Data Foundations')

    const resumeLink = container.querySelector('.continue-banner-cta') as HTMLAnchorElement
    expect(resumeLink).not.toBeNull()
    expect(resumeLink.getAttribute('href')).toBe('/lesson/12')
    expect(resumeLink.textContent).toContain('Resume Day 12')
  })
})
