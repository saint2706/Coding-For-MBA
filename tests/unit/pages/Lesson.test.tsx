import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import Lesson from '../../../src/pages/Lesson'

const { mockSetLastVisited, mockToastSuccess, mockToastInfo, mockFindInteractiveBlocks } =
  vi.hoisted(() => ({
    mockSetLastVisited: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastInfo: vi.fn(),
    mockFindInteractiveBlocks: vi.fn(
      (): Array<{
        type: string
        startIndex: number
        endIndex: number
        data: { questionText: string; answer: string }
      }> => [],
    ),
  }))

const mockGetLessonStats = vi.fn(() => ({ gotIt: 0, reviewAgain: 0, total: 0 }))

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

vi.mock('../../../src/utils/contentLoader', () => ({
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
  getPhase: (phaseNum: number) => [{ phase: 1 }, { phase: 2 }].find((p) => p.phase === phaseNum),
  getLessonsByPhase: (phase: number) => (phase === 1 ? [{ day: '1B' }] : [{ day: '2' }]),
  getCurriculumMetadata: () => ({ totalDays: 2, totalPhases: 2, totalLevels: 1 }),
  getAllLessons: () => [{ day: '1B' }, { day: '2' }],
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
  },
}))

vi.mock('../../../src/utils/progressTracker', () => ({
  setLastVisited: mockSetLastVisited,
}))

vi.mock('../../../src/stores/progressStore', () => ({
  useProgressStore: Object.assign(
    (selector: (state: { completedLessons: string[] }) => unknown) =>
      selector({ completedLessons: mockGetCompletedLessons() }),
    {
      getState: () => ({
        completedLessons: mockGetCompletedLessons(),
        toggleLessonComplete: mockToggleLessonComplete,
      }),
    },
  ),
}))

vi.mock('../../../src/utils/confetti', () => ({
  triggerSparkle: vi.fn(),
  triggerPhaseUnlockConfetti: vi.fn(),
  triggerCurriculumFireworks: vi.fn(),
}))

vi.mock('../../../src/utils/toast', () => ({
  toastSuccess: mockToastSuccess,
  toastInfo: mockToastInfo,
}))

vi.mock('../../../src/components/SEOHead', () => ({ default: () => null }))
vi.mock('../../../src/components/MarkdownRenderer', () => ({
  default: () => null,
  findInteractiveBlocks: mockFindInteractiveBlocks,
}))
vi.mock('../../../src/components/LessonSearch', () => ({ default: () => null }))
vi.mock('../../../src/stores/masteryStore', () => ({
  useMasteryStore: Object.assign(
    (selector: (state: { getLessonStats: typeof mockGetLessonStats }) => unknown) =>
      selector({ getLessonStats: mockGetLessonStats }),
    { getState: () => ({ getLessonStats: mockGetLessonStats }) },
  ),
}))
vi.mock('../../../src/components/Breadcrumb', () => ({ default: () => null }))
vi.mock('../../../src/components/BackToTop', () => ({ default: () => null }))
vi.mock('../../../src/components/TableOfContents', () => ({ default: () => null }))
vi.mock('../../../src/components/ReadingTime', () => ({ default: () => null }))
vi.mock('../../../src/components/PrerequisitePills', () => ({ default: () => null }))
vi.mock('../../../src/components/RelatedLessons', () => ({ default: () => null }))
vi.mock('../../../src/utils/seoSchemas', () => ({
  buildLessonSchema: () => ({}),
  buildFAQSchema: () => ({}),
}))
vi.mock('../../../src/stores/gamificationStore', () => ({
  useGamificationStore: Object.assign(() => ({}), {
    getState: () => ({ awardLessonCompletion: vi.fn() }),
  }),
}))

describe('Lesson completion toasts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCompletedLessons.mockReturnValue([])
    mockFindInteractiveBlocks.mockReturnValue([])
    mockGetLessonStats.mockReturnValue({ gotIt: 0, reviewAgain: 0, total: 0 })
  })

  it('renders the note panel for the current lesson', async () => {
    const { useNotesStore } = await import('../../../src/stores/notesStore')
    useNotesStore.setState({ notes: {} })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<Lesson />)
    })

    expect(container.querySelector('.lesson-note-panel')).toBeTruthy()
    expect(container.textContent).toContain('Add a note')

    await act(async () => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('toggles reading mode via the preferences store and click', async () => {
    // Arrange
    const { useUserPreferencesStore } = await import('../../../src/stores/userPreferencesStore')
    useUserPreferencesStore.setState({ readingMode: true })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<Lesson />)
    })

    const button = container.querySelector('.reading-mode-exit') as HTMLButtonElement

    // Assert button is rendered and present
    expect(button).toBeTruthy()

    // Act
    await act(async () => {
      button.click()
    })

    // Assert the state is updated (it should become false when exiting)
    const { readingMode } = useUserPreferencesStore.getState()
    expect(readingMode).toBe(false)

    // Teardown
    await act(async () => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('shows a sticky mastery mini progress bar in reading mode before reaching the bottom', async () => {
    const { useUserPreferencesStore } = await import('../../../src/stores/userPreferencesStore')
    useUserPreferencesStore.setState({ readingMode: true })

    mockFindInteractiveBlocks.mockReturnValue([
      { type: 'mastery', startIndex: 0, endIndex: 1, data: { questionText: 'Q1', answer: 'A1' } },
      { type: 'mastery', startIndex: 2, endIndex: 3, data: { questionText: 'Q2', answer: 'A2' } },
    ])
    mockGetLessonStats.mockReturnValue({ gotIt: 1, reviewAgain: 0, total: 2 })

    const originalScrollHeight = Object.getOwnPropertyDescriptor(Document.prototype, 'scrollHeight')
    const originalInnerHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight')
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2000,
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<Lesson />)
    })

    const bar = container.querySelector('.mastery-mini-progress')
    expect(bar).toBeTruthy()
    expect(bar?.querySelector('.mastery-mini-progress-label')?.textContent).toBe(
      '1/2 mastery checks answered',
    )

    await act(async () => {
      root.unmount()
    })
    document.body.removeChild(container)
    if (originalScrollHeight) {
      Object.defineProperty(document.documentElement, 'scrollHeight', originalScrollHeight)
    }
    if (originalInnerHeight) {
      Object.defineProperty(window, 'innerHeight', originalInnerHeight)
    }
    useUserPreferencesStore.setState({ readingMode: false })
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
