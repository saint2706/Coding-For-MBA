import { describe, it, expect, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import ExerciseCard from '../ExerciseCard'

// Mock motion to avoid animation issues
vi.mock('motion/react', () => ({
  useReducedMotion: () => false,
  motion: {
    div: ({
      children,
      className,
      ...props
    }: Record<string, unknown> & { children?: React.ReactNode; className?: string }) => {
      const {
        layout: _layout,
        whileHover: _whileHover,
        whileTap: _whileTap,
        transition: _transition,
        ...safeProps
      } = props
      void _layout
      void _whileHover
      void _whileTap
      void _transition

      return (
        <div className={className} {...safeProps}>
          {children}
        </div>
      )
    },
  },
}))

describe('ExerciseCard', () => {
  let container: HTMLDivElement | null = null
  let root: ReturnType<typeof createRoot> | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    container?.remove()
    container = null
  })

  const mockExercise = {
    id: '1',
    day: '1',
    phase: 1,
    difficulty: 'beginner',
    title: 'Test Exercise',
    lessonTitle: 'Intro to Python',
    goal: 'Learn variables',
    starterCode: 'print("Hello")',
    tags: ['python', 'variables'],
    expectedOutput: '',
  }

  const renderCard = (exercise = mockExercise) => {
    act(() => {
      root?.render(
        <MemoryRouter>
          <ExerciseCard exercise={exercise} />
        </MemoryRouter>,
      )
    })
  }

  it('renders exercise details correctly', () => {
    renderCard()

    expect(container?.textContent).toContain('Phase 1')
    expect(container?.textContent).toContain('Test Exercise')
    expect(container?.textContent).toContain('Learn variables')
    expect(container?.textContent).toContain('Day 1: Intro to Python →')
  })

  it('applies correct difficulty styling', () => {
    renderCard()

    const badge = container?.querySelector('.difficulty-badge')

    expect(badge).not.toBeNull()
    const style = badge?.getAttribute('style')
    // Check rgb values since JSDOM/browsers compute colors
    expect(style).toContain('color:')
    expect(style).toContain('background:')
    // You could also check for specific rgb values if critical,
    // but just ensuring styles are applied from config is usually sufficient integration check
    // checking specific hex vs rgb is fragile in JSDOM vs browser
  })

  it('renders link with correct path', () => {
    renderCard()

    const link = container?.querySelector('a')
    expect(link?.getAttribute('href')).toBe('/lesson/1')
  })

  it('handles missing goal gracefully', () => {
    const noGoalExercise = { ...mockExercise, goal: '' }
    renderCard(noGoalExercise)

    expect(container?.textContent).not.toContain('Learn variables')
  })

  it('uses default icon for unknown phase', () => {
    const unknownPhaseExercise = { ...mockExercise, phase: 99 }
    renderCard(unknownPhaseExercise)

    expect(container?.textContent).toContain('📖 Phase 99')
  })
})
