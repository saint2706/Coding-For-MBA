import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import Lesson from '../Lesson'

const mockToggleLessonComplete = vi.fn()
const mockIsLessonComplete = vi.fn(() => false)
const mockSetLastVisited = vi.fn()
const mockToastSuccess = vi.fn()
const mockToastInfo = vi.fn()

vi.mock('react-router-dom', () => ({
  useParams: () => ({ dayNum: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('../../utils/contentLoader', () => ({
  getLesson: () => ({
    day: 1,
    title: 'Intro',
    phase: 1,
    content: '# Intro',
    difficulty: 'beginner',
    tags: [],
  }),
  getAdjacentLessons: () => ({ prev: null, next: null }),
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
  },
}))

vi.mock('../../utils/progressTracker', () => ({
  isLessonComplete: (...args: unknown[]) => mockIsLessonComplete(...args),
  toggleLessonComplete: (...args: unknown[]) => mockToggleLessonComplete(...args),
  setLastVisited: (...args: unknown[]) => mockSetLastVisited(...args),
}))

vi.mock('../../utils/toast', () => ({
  toastSuccess: (...args: unknown[]) => mockToastSuccess(...args),
  toastInfo: (...args: unknown[]) => mockToastInfo(...args),
}))

vi.mock('../../components/SEOHead', () => ({ default: () => null }))
vi.mock('../../components/MarkdownRenderer', () => ({ default: () => null }))
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

describe('Lesson completion toasts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsLessonComplete.mockReturnValue(false)
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
