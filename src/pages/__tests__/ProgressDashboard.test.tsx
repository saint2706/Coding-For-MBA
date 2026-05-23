import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ProgressDashboard from '../ProgressDashboard'
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

vi.mock('../../stores/progressStore', () => ({
  useProgressStore: Object.assign(
    vi.fn((selector) => {
      const state = {
        completedLessons: ['day-1', 'day-2'],
        completedLessonsCount: () => 2,
        streakDays: () => 5,
        clearAllProgress: mockClearAllProgress,
      }
      return selector(state)
    }),
    {
      getState: () => ({
        completedLessons: ['day-1', 'day-2'],
        completedLessonsCount: () => 2,
        streakDays: () => 5,
        clearAllProgress: mockClearAllProgress,
      }),
    },
  ),
}))

vi.mock('../../stores/learningAnalyticsStore', () => ({
  useLearningAnalyticsStore: Object.assign(
    vi.fn((selector) => {
      const state = {
        timeByDate: { '2023-10-01': 3600000 },
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

vi.mock('../../stores/gamificationStore', () => ({
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

vi.mock('../../stores/userPreferencesStore', () => ({
  useUserPreferencesStore: Object.assign(
    vi.fn(() => ({
      palette: 'gradient-blues',
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
        palette: 'gradient-blues',
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

vi.mock('../../utils/contentLoader', () => ({
  getAllPhases: vi.fn(() => [
    { phase: 1, title: 'Phase 1', difficulty: 'beginner' },
    { phase: 2, title: 'Phase 2', difficulty: 'intermediate' },
  ]),
  getLessonsByPhase: vi.fn((phase) => {
    if (phase === 1)
      return [
        { day: '1', title: 'Lesson 1' } as any,
        { day: '2', title: 'Lesson 2' } as any,
      ]
    if (phase === 2) return [{ day: '3', title: 'Lesson 3' } as any]
    return []
  }),
  getLesson: vi.fn(() => ({ day: '1', title: 'Lesson 1' } as any)),
  phaseIcons: ['📖', '🚀'],
  difficultyConfig: {
    beginner: { color: 'green', bg: 'lightgreen', label: 'Beginner' },
    intermediate: { color: 'orange', bg: 'lightyellow', label: 'Intermediate' },
  },
  getCurriculumMetadata: vi.fn(() => ({ totalDays: 140 })),
}))

// Mock SEOHead as it might have issues rendering in tests due to react-helmet
vi.mock('../../components/SEOHead', () => ({
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
    const { useProgressStore } = await import('../../stores/progressStore')
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
    const loader = await import('../../utils/contentLoader')
    vi.mocked(loader.getLessonsByPhase).mockImplementationOnce(() => [])
    render(
      <MemoryRouter>
        <ProgressDashboard />
      </MemoryRouter>,
    )
    expect(screen.getAllByText('Your Progress')[0]).toBeInTheDocument()
  })

  it('handles phases with undefined lessons safely', async () => {
    const loader = await import('../../utils/contentLoader')
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

  it('updates preferences when interacting with settings', () => {
    renderComponent()

    // Test palette selection
    const dawnDuskBtn = screen.getByRole('radio', { name: 'Golden Summer Fields' })
    fireEvent.click(dawnDuskBtn)
    expect(mockSetPalette).toHaveBeenCalledWith('golden-summer-fields')

    // Test font size
    const fontSizeSelect = screen.getByLabelText('Font size')
    fireEvent.change(fontSizeSelect, { target: { value: 'lg' } })
    expect(mockSetFontSize).toHaveBeenCalledWith('lg')

    // Test layout density
    const densitySelect = screen.getByLabelText('Layout density')
    fireEvent.change(densitySelect, { target: { value: 'compact' } })
    expect(mockSetDensity).toHaveBeenCalledWith('compact')

    // Test code language
    const languageSelect = screen.getByLabelText('Preferred code language')
    fireEvent.change(languageSelect, { target: { value: 'sql' } })
    expect(mockSetCodeLanguage).toHaveBeenCalledWith('sql')

    // Test sidebar default
    const sidebarCheckbox = screen.getByRole('checkbox', { name: /Open sidebar on new pages/i })
    fireEvent.click(sidebarCheckbox)
    expect(mockSetSidebarDefaultOpen).toHaveBeenCalledWith(false)

    // Test reading mode default
    const readingModeCheckbox = screen.getByRole('checkbox', { name: /Start lessons in reading mode/i })
    fireEvent.click(readingModeCheckbox)
    expect(mockSetReadingMode).toHaveBeenCalledWith(true)

    // Test reading comfort theme
    const comfortThemeCheckbox = screen.getByRole('checkbox', { name: /Apply the softer reading palette/i })
    fireEvent.click(comfortThemeCheckbox)
    expect(mockSetReadingComfortTheme).toHaveBeenCalledWith(true)

    // Test custom cursor
    const customCursorCheckbox = screen.getByRole('checkbox', { name: /Enable enhanced pointer effects/i })
    fireEvent.click(customCursorCheckbox)
    expect(mockSetCustomCursorEnabled).toHaveBeenCalledWith(false)
  })

  it('calculates completed lessons in phase properly', async () => {
    // Override store mock to include 'day-1'
    const { useProgressStore } = await import('../../stores/progressStore')
    ;(
      useProgressStore as unknown as {
        mockImplementation: (fn: (selector: (state: unknown) => unknown) => void) => void
      }
    ).mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        completedLessons: [1],
        completedLessonsCount: () => 1,
        streakDays: () => 5,
        clearAllProgress: mockClearAllProgress,
      }),
    )

    const loader = await import('../../utils/contentLoader')
    vi.mocked(loader.getLessonsByPhase).mockImplementation((phase) => {
      if (phase === 1) return [{ day: '1', title: 'Lesson 1', phase: 1, content: '', path: '' } as any, { day: '2', title: 'Lesson 2', phase: 1, content: '', path: '' } as any]
      return []
    })

    renderComponent()

    // Wait for the specific text because the component might render asynchronously
    await waitFor(() => expect(screen.getByText('1/2 lessons')).toBeInTheDocument())
  })
})
