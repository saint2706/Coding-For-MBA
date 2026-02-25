import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { act, forwardRef, useImperativeHandle } from 'react'
import { createRoot } from 'react-dom/client'
import CodePlayground from '../CodePlayground'

// Mock dependencies
vi.mock('../CopyButton', () => ({
  default: () => <button>Copy</button>,
}))

vi.mock('../../utils/prism', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div className="syntax-highlighter">{children}</div>
  ),
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}))

// Mock Toast
vi.mock('../../utils/toast', () => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))

// Mock Confetti
vi.mock('../../utils/confetti', () => ({
  triggerQuizAcedConfetti: vi.fn(),
}))

// Mock PythonRunner to capture onExecutionComplete
let capturedOnExecutionComplete: ((result: { output: string | null; error: string | null }) => void) | undefined
const mockRunFn = vi.fn()

interface MockPythonRunnerProps {
  code: string
  compact?: boolean
  onExecutionComplete?: (result: { output: string | null; error: string | null }) => void
}

vi.mock('../PythonRunner', () => ({
  default: forwardRef((props: MockPythonRunnerProps, ref: React.Ref<unknown>) => {
    capturedOnExecutionComplete = props.onExecutionComplete
    useImperativeHandle(ref, () => ({
      run: mockRunFn,
      cancel: vi.fn(),
    }))
    return <div data-testid="python-runner" />
  }),
}))

describe('CodePlayground Interactions', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    mockRunFn.mockClear()
    capturedOnExecutionComplete = undefined
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('updates code when typing in textarea', async () => {
    await act(async () => {
      root.render(<CodePlayground initialCode="initial" />)
    })

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe('initial')

    // Simulate typing
    await act(async () => {
      // Must set value on element and trigger change event for React controlled input
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set
      nativeInputValueSetter?.call(textarea, 'new code')

      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })

    expect(textarea.value).toBe('new code')
  })

  it('resets code with confirmation', async () => {
    vi.useFakeTimers()
    await act(async () => {
      root.render(<CodePlayground initialCode="initial" />)
    })

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement

    // Change code
    await act(async () => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            'value'
          )?.set
          nativeInputValueSetter?.call(textarea, 'changed')
          textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(textarea.value).toBe('changed')

    const resetButton = container.querySelector('.code-playground__btn--reset') as HTMLButtonElement
    expect(resetButton.textContent).toContain('Reset')

    // First click: confirm state
    await act(async () => {
      resetButton.click()
    })
    expect(resetButton.textContent).toContain('Confirm?')

    // Wait 3s should reset confirm state
    await act(async () => {
        vi.advanceTimersByTime(3000)
    })
    expect(resetButton.textContent).toContain('Reset')

    // Click again to start confirm
    await act(async () => {
        resetButton.click()
    })
    expect(resetButton.textContent).toContain('Confirm?')

    // Second click immediately: actual reset
    await act(async () => {
        resetButton.click()
    })

    expect(textarea.value).toBe('initial')
    expect(resetButton.textContent).toContain('Reset')
    vi.useRealTimers()
  })

  it('runs code on Shift+Enter', async () => {
    await act(async () => {
      root.render(<CodePlayground initialCode="initial" />)
    })

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement

    await act(async () => {
      textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }))
    })

    expect(mockRunFn).toHaveBeenCalled()
  })

  it('evaluates submission and calls callbacks', async () => {
    const onExpectedOutputMatched = vi.fn()
    const onSubmissionEvaluated = vi.fn()

    await act(async () => {
      root.render(
        <CodePlayground
            initialCode="initial"
            expectedOutput="Hello World"
            onExpectedOutputMatched={onExpectedOutputMatched}
            onSubmissionEvaluated={onSubmissionEvaluated}
        />
      )
    })

    // Simulate correct execution
    await act(async () => {
        if (capturedOnExecutionComplete) {
            capturedOnExecutionComplete({ output: 'Hello World\n', error: null })
        }
    })

    expect(onExpectedOutputMatched).toHaveBeenCalled()
    expect(onSubmissionEvaluated).toHaveBeenCalledWith(expect.objectContaining({
        correct: true,
        output: 'Hello World\n',
        error: null
    }))

    // Simulate incorrect execution
    await act(async () => {
        if (capturedOnExecutionComplete) {
            capturedOnExecutionComplete({ output: 'Wrong', error: null })
        }
    })

    expect(onSubmissionEvaluated).toHaveBeenCalledWith(expect.objectContaining({
        correct: false,
        output: 'Wrong',
        error: null
    }))

     // Simulate error execution
     await act(async () => {
        if (capturedOnExecutionComplete) {
            capturedOnExecutionComplete({ output: '', error: 'SyntaxError' })
        }
    })

    expect(onSubmissionEvaluated).toHaveBeenCalledWith(expect.objectContaining({
        correct: false,
        output: '',
        error: 'SyntaxError'
    }))
  })
})
