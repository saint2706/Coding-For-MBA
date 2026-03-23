import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import ProgressDashboard from '../ProgressDashboard'
import * as contentLoader from '../../utils/contentLoader'
import { useProgressStore } from '../../stores/progressStore'
import { useLearningAnalyticsStore } from '../../stores/learningAnalyticsStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { useUserPreferencesStore } from '../../stores/userPreferencesStore'

vi.mock('../../components/SEOHead', () => ({
  default: () => <div data-testid="seo-head" />,
}))

vi.mock('../../components/Breadcrumb', () => ({
  default: () => <div data-testid="breadcrumb" />,
}))

vi.mock('../../components/ProgressBar', () => ({
  default: ({ completed, total }: any) => (
    <div data-testid="progress-bar">
      {completed}/{total}
    </div>
  ),
}))

vi.mock('../../components/AnimatedCounter', () => ({
  default: ({ value, suffix = '' }: any) => (
    <span data-testid="animated-counter">
      {value}
      {suffix}
    </span>
  ),
}))

vi.mock('../../components/EmptyStateIllustrations', () => ({
  FreshStartIllustration: () => <div data-testid="fresh-start-illustration" />,
}))

vi.mock('../../utils/contentLoader', () => ({
  getAllPhases: vi.fn(),
  getLessonsByPhase: vi.fn(),
  getLesson: vi.fn(),
  getAllLessons: vi.fn(),
  phaseIcons: ['📊'],
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
  },
}))

vi.mock('../../stores/progressStore', () => ({
  useProgressStore: vi.fn(),
}))

vi.mock('../../stores/learningAnalyticsStore', () => ({
  useLearningAnalyticsStore: vi.fn(),
  formatDuration: vi.fn().mockImplementation((ms) => `${ms}ms`),
}))

vi.mock('../../stores/gamificationStore', () => ({
  useGamificationStore: vi.fn(),
  ACHIEVEMENTS: [{ id: 'badge1', label: 'Badge 1', description: 'Desc 1', icon: '🥇' }],
}))

vi.mock('../../stores/userPreferencesStore', () => ({
  useUserPreferencesStore: vi.fn(),
}))

vi.mock('../../utils/progressTracker', () => ({
  getStreakDays: vi.fn().mockReturnValue(3),
}))

describe('ProgressDashboard', () => {
  beforeEach(() => {
    vi.mocked(contentLoader.getAllPhases).mockReturnValue([
      { phase: 1, title: 'Phase 1', difficulty: 'beginner' },
    ] as unknown as contentLoader.Phase[])
    vi.mocked(contentLoader.getAllLessons).mockReturnValue([
      { day: '1', title: 'Lesson 1' },
      { day: '2', title: 'Lesson 2' },
    ] as unknown as contentLoader.Lesson[])
    vi.mocked(contentLoader.getLessonsByPhase).mockReturnValue([
      { day: '1', title: 'Lesson 1' },
    ] as unknown as contentLoader.Lesson[])
    vi.mocked(contentLoader.getLesson).mockReturnValue({
      day: '1',
      title: 'Lesson 1',
    } as unknown as contentLoader.Lesson)

    // Progress store mock
    vi.mocked(useProgressStore).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          completedLessons: ['day-1'],
        })
      }
      return {
        getState: () => ({ clearAllProgress: vi.fn() }),
      }
    })
    Object.assign(useProgressStore, {
      getState: () => ({ clearAllProgress: vi.fn() }),
    })

    // Analytics store mock
    vi.mocked(useLearningAnalyticsStore).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          timeByDate: {},
        })
      }
      return {}
    })
    Object.assign(useLearningAnalyticsStore, {
      getState: () => ({
        totalLearningMs: () => 1000,
        weekLearningMs: () => 500,
        todayLearningMs: () => 100,
        studyStreakDays: () => 2,
        getLast7Days: () => [{ date: '2023-01-01', ms: 100 }],
      }),
    })

    // Gamification store mock
    vi.mocked(useGamificationStore).mockImplementation((selector: any) => {
      return selector({
        xpTotal: 100,
        achievementsUnlocked: ['badge1'],
        dailyChallenge: { day: '1' },
        refreshDailyChallenge: vi.fn(),
        xpToNextMilestone: () => ({ percent: 50, next: 200 }),
      })
    })

    // Preferences store mock
    vi.mocked(useUserPreferencesStore).mockReturnValue({
      palette: 'peach-sorbet',
      fontSize: 'md',
      density: 'comfortable',
      codeLanguage: 'python',
      sidebarDefaultOpen: true,
      readingMode: false,
      readingComfortTheme: false,
      customCursorEnabled: false,
      setPalette: vi.fn(),
      setFontSize: vi.fn(),
      setDensity: vi.fn(),
      setCodeLanguage: vi.fn(),
      setSidebarDefaultOpen: vi.fn(),
      setReadingMode: vi.fn(),
      setReadingComfortTheme: vi.fn(),
      setCustomCursorEnabled: vi.fn(),
    } as unknown as typeof useUserPreferencesStore)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders overall stats correctly', () => {
    render(
      <MemoryRouter>
        <ProgressDashboard />
      </MemoryRouter>,
    )

    expect(screen.getByText('Your Progress')).toBeInTheDocument()
    // 1 completed out of 2 total = 50%
    expect(screen.getAllByTestId('animated-counter')[0]).toHaveTextContent('50%')
  })

  it('renders gamification section', () => {
    render(
      <MemoryRouter>
        <ProgressDashboard />
      </MemoryRouter>,
    )

    expect(screen.getByText('Gamification')).toBeInTheDocument()
    expect(screen.getByText('Badge 1')).toBeInTheDocument()
    expect(screen.getByText('Day 1: Lesson 1')).toBeInTheDocument()
  })

  it('renders learning analytics section', () => {
    render(
      <MemoryRouter>
        <ProgressDashboard />
      </MemoryRouter>,
    )

    expect(screen.getByText('Learning Analytics')).toBeInTheDocument()
    expect(screen.getAllByText('1000ms')[0]).toBeInTheDocument() // Total
    expect(screen.getByText('500ms')).toBeInTheDocument() // Week
    expect(screen.getByText('100ms')).toBeInTheDocument() // Today
  })

  it('renders empty state when no lessons completed', () => {
    vi.mocked(useProgressStore).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          completedLessons: [],
        })
      }
      return {
        getState: () => ({ clearAllProgress: vi.fn() }),
      }
    })

    render(
      <MemoryRouter>
        <ProgressDashboard />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('fresh-start-illustration')).toBeInTheDocument()
  })

  it('prompts confirmation when clearing progress', () => {
    const clearAllProgressMock = vi.fn()
    vi.mocked(useProgressStore).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          completedLessons: ['day-1'],
        })
      }
      return {
        getState: () => ({ clearAllProgress: clearAllProgressMock }),
      }
    })
    Object.assign(useProgressStore, {
      getState: () => ({ clearAllProgress: clearAllProgressMock }),
    })

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <MemoryRouter>
        <ProgressDashboard />
      </MemoryRouter>,
    )

    const clearButton = screen.getByText('Clear All Progress')
    fireEvent.click(clearButton)

    expect(confirmSpy).toHaveBeenCalled()
    expect(clearAllProgressMock).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })
})
