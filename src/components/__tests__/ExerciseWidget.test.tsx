import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { act } from 'react'
import { waitFor } from '@testing-library/react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import ExerciseWidget from '../ExerciseWidget'
import { triggerDayExercisesCompleteConfetti } from '../../utils/confetti'
import { toastSuccess } from '../../utils/toast'
import { markExerciseComplete } from '../../utils/exerciseProgress'

// Mock SyntaxHighlighter
vi.mock('../../utils/prism', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <pre className="syntax-highlighter">{children}</pre>
  ),
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}))

// Mock CodePlayground to capture props

let capturedCodePlaygroundProps: Record<string, unknown> | null = null
const mockSetCode = vi.fn()

vi.mock('../CodePlayground', () => ({
  default: React.forwardRef((props: Record<string, unknown>, ref: React.ForwardedRef<unknown>) => {
    capturedCodePlaygroundProps = props
    React.useImperativeHandle(ref, () => ({
      setCode: mockSetCode,
      run: vi.fn(),
      reset: vi.fn(),
    }))
    return <div className="code-playground-mock" />
  }),
}))

// Mock CopyButton
vi.mock('../CopyButton', () => ({
  default: () => <button>Copy</button>,
}))

// Mock Utils
vi.mock('../../utils/confetti', () => ({
  triggerDayExercisesCompleteConfetti: vi.fn(),
}))

vi.mock('../../utils/toast', () => ({
  toastSuccess: vi.fn(),
}))

vi.mock('../../utils/exerciseProgress', () => ({
  markExerciseComplete: vi.fn(),
}))

vi.mock('../../utils/contentLoader', () => ({
  getAllExercises: () => [{ day: '1', title: 'Test Exercise' }],
}))

// Mock Stores
const mockRecordAttempt = vi.fn()
const mockGetQuizStats = vi.fn().mockReturnValue({ attempts: 0, accuracy: 0, incorrect: 0 })
const mockGetRecentAttempts = vi.fn().mockReturnValue([])

vi.mock('../../stores/quizStore', () => ({
  useQuizStore: Object.assign(
    // Hook implementation

    (selector: (state: Record<string, unknown>) => unknown) => {
      // Mock state for selector
      const state = {
        getQuizStats: mockGetQuizStats,
        getRecentAttempts: mockGetRecentAttempts,
      }
      // Simplified selector execution for useShallow
      // In real app useShallow wraps the selector. Here we assume selector is the function passed to useQuizStore
      // Use a simple pass-through or try to execute it
      try {
        return selector(state)
      } catch {
        return undefined
      }
    },
    // Static methods
    {
      getState: () => ({
        recordAttempt: mockRecordAttempt,
        getQuizStats: mockGetQuizStats,
      }),
    },
  ),
}))

const mockAwardExerciseCompletion = vi.fn()
const mockAwardPerfectQuiz = vi.fn()

vi.mock('../../stores/gamificationStore', () => ({
  useGamificationStore: {
    getState: () => ({
      awardExerciseCompletion: mockAwardExerciseCompletion,
      awardPerfectQuiz: mockAwardPerfectQuiz,
    }),
  },
}))

describe('ExerciseWidget', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    capturedCodePlaygroundProps = null
    vi.clearAllMocks()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  const defaultProps = {
    title: 'Test Exercise',
    goal: 'Test Goal',
    instructions: 'Step 1\nStep 2',
    starterCode: 'def start(): pass',
    solution: 'def solution(): return True',
    expectedOutput: 'True',
  }

  it('renders content correctly', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/lesson/1']}>
          <ExerciseWidget {...defaultProps} />
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Test Exercise')
    expect(container.textContent).toContain('Test Goal')
    expect(container.textContent).toContain('Step 1')
    expect(container.textContent).toContain('Step 2')
  })

  it('handles submission evaluation correctly', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/lesson/1']}>
          <ExerciseWidget {...defaultProps} />
        </MemoryRouter>,
      )
    })

    // Simulate submission from CodePlayground
    const result = {
      correct: true,
      output: 'True',
      error: null,
      attemptedAt: new Date(),
    }

    await act(async () => {
      ;(
        capturedCodePlaygroundProps as unknown as {
          onSubmissionEvaluated: (res: typeof result) => void
        }
      )?.onSubmissionEvaluated(result)
    })

    expect(mockRecordAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        correct: true,
        output: 'True',
        quizId: expect.stringContaining('test-exercise'),
      }),
    )
  })

  it('awards completion and confetti when matched', async () => {
    vi.mocked(markExerciseComplete).mockReturnValue(true) // All exercises complete

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/lesson/1']}>
          <ExerciseWidget {...defaultProps} />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      ;(
        capturedCodePlaygroundProps as unknown as { onExpectedOutputMatched: () => void }
      )?.onExpectedOutputMatched()
    })

    expect(mockAwardExerciseCompletion).toHaveBeenCalled()
    expect(markExerciseComplete).toHaveBeenCalled()
    expect(triggerDayExercisesCompleteConfetti).toHaveBeenCalled()
    expect(toastSuccess).toHaveBeenCalledWith(expect.stringContaining('All exercises complete'))
  })

  it('lazy loads the solution content', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ExerciseWidget {...defaultProps} />
        </MemoryRouter>,
      )
    })

    // 1. Initial state: Solution button exists
    const showButton = container.querySelector(
      '.exercise-widget__solution-btn',
    ) as HTMLButtonElement
    expect(showButton).not.toBeNull()
    expect(showButton.textContent).toContain('Show Solution')

    // The solution code (SyntaxHighlighter mock) should NOT be in the document initially
    const solutionCode = container.querySelector('.syntax-highlighter')
    expect(solutionCode).toBeNull()

    // 2. Click "Show Solution"
    await act(async () => {
      showButton.click()
    })

    // Button text should change
    expect(showButton.textContent).toContain('Hide Solution')

    // Solution code SHOULD now be in the document
    const solutionCodeVisible = container.querySelector('.syntax-highlighter')
    expect(solutionCodeVisible).not.toBeNull()
    expect(solutionCodeVisible?.textContent).toBe('def solution(): return True')

    // 3. Click "Hide Solution"
    await act(async () => {
      showButton.click()
    })

    await waitFor(() => {
      expect(showButton.textContent).toContain('Show Solution')
      const solutionCodeHidden = container.querySelector('.syntax-highlighter')
      expect(solutionCodeHidden).toBeNull()
    })

    // Button text should change back
    expect(showButton.textContent).toContain('Show Solution')


  })

  it('requires confirmation before loading solution', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ExerciseWidget {...defaultProps} />
        </MemoryRouter>,
      )
    })

    // Open solution
    const showButton = container.querySelector(
      '.exercise-widget__solution-btn',
    ) as HTMLButtonElement
    await act(async () => {
      showButton.click()
    })

    const tryButton = container.querySelector(
      'button[aria-label="Load solution into playground"]',
    ) as HTMLButtonElement
    expect(tryButton).not.toBeNull()
    expect(tryButton.textContent).toContain('Try Solution')

    // Click 1: Confirm state
    await act(async () => {
      tryButton.click()
    })
    expect(tryButton.textContent).toContain('Confirm')
    expect(mockSetCode).not.toHaveBeenCalled()

    // Click 2: Load solution
    await act(async () => {
      tryButton.click()
    })
    expect(mockSetCode).toHaveBeenCalledWith('def solution(): return True')

    // Should reset after click
    expect(tryButton.textContent).toContain('Try Solution')
  })
})
