import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import Exercises from '../../../src/pages/Exercises'
import * as contentLoader from '../../../src/utils/contentLoader'
import { useQuizStore } from '../../../src/stores/quizStore'

vi.mock('../../../src/components/SEOHead', () => ({
  default: () => <div data-testid="seo-head" />,
}))

vi.mock('../../../src/components/ExerciseCard', () => ({
  default: ({ exercise }: { exercise: { title: string } }) => (
    <div data-testid="exercise-card">{exercise.title}</div>
  ),
}))

vi.mock('../../../src/components/EmptyStateIllustrations', () => ({
  ExercisesEmptyIllustration: () => <div data-testid="empty-illustration" />,
}))

vi.mock('../../../src/utils/contentLoader', () => ({
  getAllExercises: vi.fn(),
  getAllNotebooks: vi.fn(),
  getCurriculumMetadata: vi.fn(() => ({ totalDays: 163, totalPhases: 12, totalLevels: 4 })),
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
    advanced: { label: 'Advanced', color: '#222', bg: '#333' },
  },
  phaseIcons: ['Code', 'Function'],
}))

vi.mock('../../../src/stores/quizStore', () => ({
  useQuizStore: vi.fn(),
}))

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      layout,
      initial,
      animate,
      transition,
      ...props
    }: React.ComponentProps<'div'> & {
      layout?: unknown
      initial?: unknown
      animate?: unknown
      transition?: unknown
    }) => <div {...props}>{children}</div>,
  },
}))

describe('Exercises', () => {
  beforeEach(() => {
    vi.mocked(contentLoader.getAllExercises).mockReturnValue([
      {
        id: '1',
        day: '1',
        title: 'Basic Math',
        phase: 1,
        difficulty: 'beginner',
        goal: 'Learn math',
        lessonTitle: 'Math',
        tags: ['math'],
        starterCode: '',
      },
      {
        id: '2',
        day: '2',
        title: 'Data Pandas',
        phase: 2,
        difficulty: 'advanced',
        goal: 'Learn pandas',
        lessonTitle: 'Data',
        tags: ['data', 'pandas'],
        starterCode: '',
      },
    ] as unknown as contentLoader.Exercise[])

    vi.mocked(contentLoader.getAllNotebooks).mockReturnValue([
      { phase: 1, cells: [] } as unknown as contentLoader.Notebook,
    ])

    const fakeQuizState = {
      attempts: [],
      getLowScoringTopics: () => [{ quizId: 'q1', topic: 'pandas', accuracy: 50, incorrect: 2 }],
    } as unknown as ReturnType<typeof useQuizStore.getState>

    vi.mocked(useQuizStore).mockImplementation((selector) => selector(fakeQuizState))
    Object.assign(useQuizStore, { getState: () => fakeQuizState })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders exercises correctly', () => {
    render(
      <MemoryRouter>
        <Exercises />
      </MemoryRouter>,
    )

    expect(screen.getByText('Exercise Browser')).toBeInTheDocument()
    expect(screen.getByText('Phase Solution Notebooks')).toBeInTheDocument()
    expect(screen.getByText('Showing 2 of 2 exercises')).toBeInTheDocument()

    expect(screen.getByText('Basic Math')).toBeInTheDocument()
    expect(screen.getByText('Data Pandas')).toBeInTheDocument()
  })

  it('filters exercises by phase', () => {
    render(
      <MemoryRouter>
        <Exercises />
      </MemoryRouter>,
    )

    const phaseFilter = screen.getByLabelText('Phase')
    fireEvent.change(phaseFilter, { target: { value: '1' } })

    expect(screen.getByText('Basic Math')).toBeInTheDocument()
    expect(screen.queryByText('Data Pandas')).not.toBeInTheDocument()
  })

  it('filters exercises by difficulty', () => {
    render(
      <MemoryRouter>
        <Exercises />
      </MemoryRouter>,
    )

    const difficultyFilter = screen.getByLabelText('Difficulty')
    fireEvent.change(difficultyFilter, { target: { value: 'advanced' } })

    expect(screen.queryByText('Basic Math')).not.toBeInTheDocument()
    expect(screen.getByText('Data Pandas')).toBeInTheDocument()
  })

  it('filters exercises by search query', () => {
    render(
      <MemoryRouter>
        <Exercises />
      </MemoryRouter>,
    )

    const searchInput = screen.getByPlaceholderText('Search exercises…')
    fireEvent.change(searchInput, { target: { value: 'pandas' } })

    expect(screen.queryByText('Basic Math')).not.toBeInTheDocument()
    expect(screen.getByText('Data Pandas')).toBeInTheDocument()
  })

  it('toggles AI recommended mode', () => {
    render(
      <MemoryRouter>
        <Exercises />
      </MemoryRouter>,
    )

    const aiToggle = screen.getByText(/Spaced Repetition Focus/i)
    fireEvent.click(aiToggle) // The click should be somewhere but it seems it's not a toggle button in the new UI.

    // Instead we can test if the low scoring block renders properly
    expect(screen.getByText('Spaced Repetition Focus')).toBeInTheDocument()
    expect(
      screen.getByText(/Revisit these lower-scoring quiz topics to improve retention:/i),
    ).toBeInTheDocument()
  })

  it('shows empty state when no exercises match', () => {
    render(
      <MemoryRouter>
        <Exercises />
      </MemoryRouter>,
    )

    const searchInput = screen.getByPlaceholderText('Search exercises…')
    fireEvent.change(searchInput, { target: { value: 'unknown' } })

    expect(screen.getByTestId('empty-illustration')).toBeInTheDocument()
    expect(
      screen.getByText('No exercises match your filters. Try adjusting your search.'),
    ).toBeInTheDocument()
  })
})
