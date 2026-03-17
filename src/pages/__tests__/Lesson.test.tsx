import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import Lesson from '../Lesson'

const {
  mockSetLastVisited,
  mockToastSuccess,
  mockToastInfo,
} = vi.hoisted(() => ({
  mockSetLastVisited: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastInfo: vi.fn(),
}))

const mockToggleLessonComplete = vi.fn()
const mockGetCompletedLessons = vi.fn(() => [])

vi.mock('react-router-dom', () => ({
  useParams: () => ({ dayNum: '1B' }),
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('../../utils/contentLoader', () => ({
  getLesson: () => ({
    day: '1B',
    title: 'Intro',
    phase: 1,
    content: '# Intro',
    difficulty: 'beginner',
    tags: [],
  }),
  getAdjacentLessons: () => ({ prev: null, next: null }),
  getAllPhases: () => [{ phase: 1 }, { phase: 2 }],
  getLessonsByPhase: (phase: number) => (phase === 1 ? [{ day: '1B' }] : [{ day: '2' }]),
  getAllLessons: () => [{ day: '1B' }, { day: '2' }],
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
  },
}))

vi.mock('../../utils/progressTracker', () => ({
  setLastVisited: mockSetLastVisited,
}))

vi.mock('../../stores/progressStore', () => ({
  useProgressStore: Object.assign(
    (selector: any) => selector({ completedLessons: mockGetCompletedLessons() }),
    {
      getState: () => ({
        completedLessons: mockGetCompletedLessons(),
        toggleLessonComplete: mockToggleLessonComplete,
      }),
    }
  ),
}))

vi.mock('../../utils/confetti', () => ({
  triggerSparkle: vi.fn(),
  triggerPhaseUnlockConfetti: vi.fn(),
  triggerCurriculumFireworks: vi.fn(),
}))

vi.mock('../../utils/toast', () => ({
  toastSuccess: mockToastSuccess,
  toastInfo: mockToastInfo,
}))

vi.mock('../../components/SEOHead', () => ({ default: () => null }))
vi.mock('../../components/MarkdownRenderer', () => ({
  default: () => null,
  findInteractiveBlocks: () => [],
}))
vi.mock('../../components/Breadcrumb', () => ({ default: () => null }))
vi.mock('../../components/BackToTop', () => ({ default: () => null }))
vi.mock('../../components/TableOfContents', () => ({ default: () => null }))
vi.mock('../../components/ReadingTime', () => ({ default: () => null }))
vi.mock('../../components/PrerequisitePills', () => ({ default: () => null }))
vi.mock('../../components/RelatedLessons', () => ({ default: () => null }))
vi.mock('../../hooks/useSwipe', () => ({
  useSwipe: () => ({ current: null }),
}))
vi.mock('../../utils/seoSchemas', () => ({
  buildLessonSchema: () => ({}),
}))
vi.mock('../../stores/gamificationStore', () => ({
  useGamificationStore: Object.assign(() => ({}), {
    getState: () => ({ awardLessonCompletion: vi.fn() }),
  }),
}))

describe('Lesson completion toasts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCompletedLessons.mockReturnValue([])
  })

  it('shows completion/incomplete toasts and debounces rapid duplicate clicks', async () => {
    let currentTime = 1000
    const nowSpy = vi.spyOn(Date, 'now').mockImplementation(() => currentTime)

    mockToggleLessonComplete
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<Lesson />)
    })

    const button = container.querySelector('.lesson-complete-btn') as HTMLButtonElement

    await act(async () => {
      button.click()
    })

    currentTime = 1200
    await act(async () => {
      button.click()
    })

    currentTime = 1700
    await act(async () => {
      button.click()
    })

    expect(mockToastSuccess).toHaveBeenCalledWith('Progress saved ✓')
    expect(mockToastSuccess).toHaveBeenCalledTimes(1)
    expect(mockToastInfo).toHaveBeenCalledWith('Marked as incomplete')
    expect(mockToastInfo).toHaveBeenCalledTimes(1)

    nowSpy.mockRestore()
    await act(async () => {
      root.unmount()
    })
    document.body.removeChild(container)
  })
})
