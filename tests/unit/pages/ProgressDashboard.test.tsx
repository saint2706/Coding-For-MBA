import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ProgressDashboard from '../../../src/pages/ProgressDashboard'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'

const mockClearAllProgress = vi.fn()
const mockRefreshDailyChallenge = vi.fn()

const mockSetPalette = vi.fn()
const mockSetFontSize = vi.fn()
const mockSetDensity = vi.fn()
const mockSetCodeLanguage = vi.fn()
const mockSetSidebarDefaultOpen = vi.fn()
const mockSetReadingMode = vi.fn()
const mockSetReadingComfortTheme = vi.fn()
const mockSetCustomCursorEnabled = vi.fn()

vi.mock('../../../src/stores/progressStore', () => ({
  useProgressStore: Object.assign(
    vi.fn((selector) => {
      const state = {
        completedLessons: ['day-1', 'day-2'],
        completedLessonsCount: () => 2,
        streakDays: () => 5,
        clearAllProgress: mockClearAllProgress,
        completionDates: { 1: '2023-10-01', 2: '2023-10-02' },
      }
      return selector(state)
    }),
    {
      getState: () => ({
        completedLessons: ['day-1', 'day-2'],
        completedLessonsCount: () => 2,
        streakDays: () => 5,
        clearAllProgress: mockClearAllProgress,
        completionDates: { 1: '2023-10-01', 2: '2023-10-02' },
      }),
    },
  ),
}))

vi.mock('../../../src/stores/learningAnalyticsStore', () => ({
  useLearningAnalyticsStore: Object.assign(
    vi.fn((selector) => {
      const state = {
        timeByDate: { '2023-10-01': 3600000 },
        timeByLessonDay: { 1: 600000 },
        totalLearningMs: () => 3600000,
        weekLearningMs: () => 3600000,
        todayLearningMs: () => 3600000,
        studyStreakDays: () => 1,
        getLast7Days: () => [
          { date: '2023-10-01', ms: 3600000 },
          { date: '2023-10-02', ms: 0 },
          { date: '2023-10-03', ms: 0 },
          { date: '2023-10-04', ms: 0 },
          { date: '2023-10-05', ms: 0 },
          { date: '2023-10-06', ms: 0 },
          { date: '2023-10-07', ms: 0 },
        ],
      }
      return selector(state)
    }),
    {
      getState: () => ({
        timeByDate: { '2023-10-01': 3600000 },
        timeByLessonDay: { 1: 600000 },
        totalLearningMs: () => 3600000,
        weekLearningMs: () => 3600000,
        todayLearningMs: () => 3600000,
        studyStreakDays: () => 1,
        getLast7Days: () => [
          { date: '2023-10-01', ms: 3600000 },
          { date: '2023-10-02', ms: 0 },
          { date: '2023-10-03', ms: 0 },
          { date: '2023-10-04', ms: 0 },
          { date: '2023-10-05', ms: 0 },
          { date: '2023-10-06', ms: 0 },
          { date: '2023-10-07', ms: 0 },
        ],
      }),
    },
  ),
  formatDuration: vi.fn(() => '1h 0m'),
}))

vi.mock('../../../src/stores/gamificationStore', () => ({
  useGamificationStore: Object.assign(
    vi.fn((selector) => {
      const state = {
        xpTotal: 100,
        achievementsUnlocked: ['first_lesson', 'scholar'],
        dailyChallenge: { day: 1, type: 'review' },
        refreshDailyChallenge: mockRefreshDailyChallenge,
        xpToNextMilestone: () => ({ next: 50, percent: 66 }),
      }
      return selector(state)
    }),
    {
      getState: () => ({
        xpTotal: 100,
        achievementsUnlocked: ['first_lesson', 'scholar'],
        dailyChallenge: { day: 1, type: 'review' },
        refreshDailyChallenge: mockRefreshDailyChallenge,
        xpToNextMilestone: () => ({ next: 50, percent: 66 }),
      }),
    },
  ),
  ACHIEVEMENTS: [
    { id: 'first_lesson', label: 'First Lesson', description: 'desc', icon: '⭐' },
    { id: 'scholar', label: 'Scholar', description: 'desc', icon: '🎓' },
  ],
}))

vi.mock('../../../src/stores/userPreferencesStore', () => ({
  useUserPreferencesStore: Object.assign(
    vi.fn(() => ({
      palette: 'terminal-dark',
      sidebarDefaultOpen: true,
      fontSize: 'md',
      codeLanguage: 'python',
      density: 'comfortable',
      readingMode: false,
      readingComfortTheme: false,
      customCursorEnabled: true,
      setPalette: mockSetPalette,
      setSidebarDefaultOpen: mockSetSidebarDefaultOpen,
      setFontSize: mockSetFontSize,
      setCodeLanguage: mockSetCodeLanguage,
      setDensity: mockSetDensity,
      setReadingMode: mockSetReadingMode,
      setReadingComfortTheme: mockSetReadingComfortTheme,
      setCustomCursorEnabled: mockSetCustomCursorEnabled,
    })),
    {
      getState: () => ({
        palette: 'terminal-dark',
        sidebarDefaultOpen: true,
        fontSize: 'md',
        codeLanguage: 'python',
        density: 'comfortable',
        readingMode: false,
        readingComfortTheme: false,
        customCursorEnabled: true,
        setPalette: mockSetPalette,
        setSidebarDefaultOpen: mockSetSidebarDefaultOpen,
        setFontSize: mockSetFontSize,
        setCodeLanguage: mockSetCodeLanguage,
        setDensity: mockSetDensity,
        setReadingMode: mockSetReadingMode,
        setReadingComfortTheme: mockSetReadingComfortTheme,
        setCustomCursorEnabled: mockSetCustomCursorEnabled,
      }),
    },
  ),
}))

vi.mock('../../../src/utils/contentLoader', () => ({
  getAllPhases: vi.fn(() => [
    { phase: 1, title: 'Phase 1', difficulty: 'beginner' },
    { phase: 2, title: 'Phase 2', difficulty: 'intermediate' },
  ]),
  getLessonsByPhase: vi.fn((phase) => {
    if (phase === 1)
      return [
        { day: 1, title: 'Lesson 1' },
        { day: 2, title: 'Lesson 2' },
      ]
    if (phase === 2) return [{ day: 3, title: 'Lesson 3' }]
    return []
  }),
  getLesson: vi.fn(() => ({ day: 1, title: 'Lesson 1' })),
  phaseIcons: ['📖', '🚀'],
  difficultyConfig: {
    beginner: { color: 'green', bg: 'lightgreen', label: 'Beginner' },
    intermediate: { color: 'orange', bg: 'lightyellow', label: 'Intermediate' },
  },
  getCurriculumMetadata: vi.fn(() => ({ totalDays: 145 })),
}))

// Mock SEOHead as it might have issues rendering in tests due to react-helmet
vi.mock('../../../src/components/SEOHead', () => ({
  default: () => <div data-testid="mock-seo-head"></div>,
}))

class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

describe('ProgressDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
    window.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof window.IntersectionObserver
  })
  afterEach(() => {
    vi.restoreAllMocks()
    delete (window as unknown as { confirm?: unknown }).confirm
    delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver
  })

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ProgressDashboard />
      </MemoryRouter>,
    )
  }

  it('renders progress dashboard without crashing', async () => {
    renderComponent()
    await waitFor(() => expect(screen.getAllByText('Your Progress')[0]).toBeInTheDocument())
  })

  it('clears progress when confirmed', () => {
    renderComponent()
    const clearBtn = screen.getByRole('button', { name: /Clear All Progress/i })
    fireEvent.click(clearBtn)
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to clear all progress? This cannot be undone.',
    )
    expect(mockClearAllProgress).toHaveBeenCalled()
  })

  it('does not clear progress when cancelled', () => {
    window.confirm = vi.fn(() => false)
    renderComponent()
    const clearBtn = screen.getByRole('button', { name: /Clear All Progress/i })
    fireEvent.click(clearBtn)
    expect(mockClearAllProgress).not.toHaveBeenCalled()
  })

  it('shows empty state when no progress', async () => {
    // We'll mock the store locally for this test
    const { useProgressStore } = await import('../../../src/stores/progressStore')
    ;(
      useProgressStore as unknown as {
        mockImplementation: (fn: (selector: (state: unknown) => unknown) => unknown) => void
      }
    ).mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        completedLessons: [],
        completedLessonsCount: () => 0,
        streakDays: () => 0,
        clearAllProgress: mockClearAllProgress,
      }),
    )

    renderComponent()

    expect(screen.getByText(/Your journey begins here/i)).toBeInTheDocument()
  })
  it('handles phases with no lessons safely', async () => {
    const loader = await import('../../../src/utils/contentLoader')
    vi.mocked(loader.getLessonsByPhase).mockImplementationOnce(() => [])
    render(
      <MemoryRouter>
        <ProgressDashboard />
      </MemoryRouter>,
    )
    expect(screen.getAllByText('Your Progress')[0]).toBeInTheDocument()
  })

  it('renders the streak as block glyphs alongside the numeric count', async () => {
    // Set state explicitly rather than relying on the module-level default —
    // the "shows empty state" test above permanently overrides the mock's
    // implementation (vi.restoreAllMocks() has no effect on a non-spy vi.fn()).
    const { useProgressStore } = await import('../../../src/stores/progressStore')
    ;(
      useProgressStore as unknown as {
        mockImplementation: (fn: (selector: (state: unknown) => unknown) => unknown) => void
      }
    ).mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        completedLessons: ['day-1', 'day-2'],
        completedLessonsCount: () => 2,
        streakDays: () => 3,
        clearAllProgress: mockClearAllProgress,
        completionDates: { 1: '2023-10-01', 2: '2023-10-02' },
      }),
    )

    renderComponent()
    await waitFor(() => expect(screen.getAllByText('Your Progress')[0]).toBeInTheDocument())
    const blocks = document.querySelectorAll('.progress-streak-blocks')
    expect(blocks.length).toBeGreaterThan(0)
    expect(blocks[0]!.textContent).toBe('■■■□□□□')
  })

  it('renders a Recent Activity section from completionDates', async () => {
    const { useProgressStore } = await import('../../../src/stores/progressStore')
    ;(
      useProgressStore as unknown as {
        mockImplementation: (fn: (selector: (state: unknown) => unknown) => unknown) => void
      }
    ).mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        completedLessons: ['day-1', 'day-2'],
        completedLessonsCount: () => 2,
        streakDays: () => 5,
        clearAllProgress: mockClearAllProgress,
        completionDates: { 1: '2023-10-01', 2: '2023-10-02' },
      }),
    )

    renderComponent()
    await waitFor(() => expect(screen.getByText('Recent Activity')).toBeInTheDocument())
    expect(
      screen.getByText(
        /completed today|completed yesterday|completed \d+ days ago|completed 2023-10-02/i,
      ),
    ).toBeInTheDocument()
  })

  it('shows a heatmap cell tooltip on hover and hides it on mouse leave', async () => {
    renderComponent()
    await waitFor(() => expect(screen.getAllByText('Your Progress')[0]).toBeInTheDocument())
    const cell = document.querySelector('.heatmap-cell')
    expect(cell).toBeTruthy()
    expect(document.querySelector('.heatmap-tooltip')).not.toBeInTheDocument()

    fireEvent.mouseEnter(cell!)
    expect(document.querySelector('.heatmap-tooltip')).toBeInTheDocument()

    fireEvent.mouseLeave(cell!)
    expect(document.querySelector('.heatmap-tooltip')).not.toBeInTheDocument()
  })

  it('handles phases with undefined lessons safely', async () => {
    const loader = await import('../../../src/utils/contentLoader')
    vi.mocked(loader.getLessonsByPhase).mockImplementationOnce(
      () => undefined as unknown as ReturnType<typeof loader.getLessonsByPhase>,
    )
    render(
      <MemoryRouter>
        <ProgressDashboard />
      </MemoryRouter>,
    )
    expect(screen.getAllByText('Your Progress')[0]).toBeInTheDocument()
  })
})
