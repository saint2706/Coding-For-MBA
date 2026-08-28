import { afterEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import Home from '../../../src/pages/Home'

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
  useNavigate: () => () => undefined,
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

vi.mock('../../../src/utils/seoSchemas', () => ({
  buildWebSiteSchema: () => ({}),
  buildCourseSchema: () => ({}),
  buildProductSchema: () => ({}),
}))

vi.mock('../../../src/components/SEOHead', () => ({ default: () => null }))
vi.mock('../../../src/components/AnimatedCounter', () => ({
  default: ({ value }: { value: number }) => <>{value}</>,
}))
vi.mock('../../../src/components/ProgressBar', () => ({ default: () => null }))
vi.mock('../../../src/components/ConceptGraph', () => ({ default: () => null }))

vi.mock('../../../src/stores/gamificationStore', () => {
  const state = {
    xpTotal: 0,
    dailyChallenge: { day: 0, dateKey: '' },
    refreshDailyChallenge: () => undefined,
  }
  const storeFn = (selector: (s: typeof state) => unknown) => selector(state)
  storeFn.getState = () => state
  return { useGamificationStore: storeFn }
})

vi.mock('../../../src/stores/progressStore', () => {
  const storeFn = (
    selector: (state: {
      lastVisitedLesson: string | null
      completedLessons: number[]
      completedLessonsCount: () => number
      streakDays: () => number
      completionDates: Record<number, string>
    }) => unknown,
  ) =>
    selector({
      lastVisitedLesson: mockGetLastVisited(),
      completedLessons: Array.from({ length: mockGetCompletedCount() }).map((_, i) => i + 1),
      completedLessonsCount: () => mockGetCompletedCount(),
      streakDays: () => 0,
      completionDates: {},
    })
  storeFn.getState = () => ({
    completedLessons: Array.from({ length: mockGetCompletedCount() }).map((_, i) => i + 1),
    completedLessonsCount: () => mockGetCompletedCount(),
    lastVisitedLesson: mockGetLastVisited(),
  })
  return { useProgressStore: storeFn }
})

vi.mock('../../../src/stores/learningAnalyticsStore', () => ({
  useLearningAnalyticsStore: (selector: (state: { todayLearningMs: () => number }) => unknown) =>
    selector({ todayLearningMs: () => 0 }),
  formatDuration: (ms: number) => (ms <= 0 ? '0m' : `${Math.round(ms / 60000)}m`),
}))

vi.mock('../../../src/utils/contentLoader', () => ({
  getCurriculumMetadata: () => ({ totalDays: 1, totalPhases: 1, totalLevels: 1 }),
  getReadingTime: () => 5,
  getTotalReadingTime: () => 5,
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

    // The new editorial cover surfaces a resume affordance, and the dashboard
    // LAST OPEN tile carries the lesson title.
    expect(container.textContent).toContain('SQL Basics')

    const resumeLink = container.querySelector('.action-primary') as HTMLAnchorElement
    expect(resumeLink).not.toBeNull()
    expect(resumeLink.getAttribute('href')).toBe('/lesson/12')
    expect(resumeLink.textContent).toContain('Resume Day 12')
  })
})
