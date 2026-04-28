import { render, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import PythonRunner, { PythonRunnerHandle } from '../PythonRunner'
import * as usePyodideHook from '../../hooks/usePyodide'
import * as codeSecurity from '../../utils/codeSecurity'

vi.mock('../../hooks/usePyodide', () => ({
  usePyodide: vi.fn(),
}))

vi.mock('../../utils/codeSecurity', () => ({
  validatePythonCode: vi.fn(),
}))

describe('PythonRunner', () => {
  let mockRunPython: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockRunPython = vi.fn()
    vi.mocked(usePyodideHook.usePyodide).mockReturnValue({
      loading: false,
      error: null,
      runPython: mockRunPython,
      ensureLoaded: vi.fn(),
      isReady: true,
      loadPyodide: vi.fn(),
    } as unknown as ReturnType<typeof usePyodideHook.usePyodide>)
    vi.mocked(codeSecurity.validatePythonCode).mockReturnValue({ valid: true, error: undefined })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders idle state correctly', () => {
    const { getByRole, queryByRole } = render(<PythonRunner code="print('hello')" />)
    const runBtn = getByRole('button', { name: /Run Python code/i })
    expect(runBtn).toBeDefined()
    expect(queryByRole('button', { name: /Cancel current Python execution/i })).toBeNull()
  })

  it('renders loading pyodide state', () => {
    vi.mocked(usePyodideHook.usePyodide).mockReturnValue({
      loading: true,
      error: null,
      runPython: mockRunPython,
      ensureLoaded: vi.fn(),
      isReady: false,
      loadPyodide: vi.fn(),
    } as unknown as ReturnType<typeof usePyodideHook.usePyodide>)
    const { getByRole } = render(<PythonRunner code="print('hello')" />)
    const runBtn = getByRole('button', { name: /Loading Python environment.../i })
    expect(runBtn).toBeDefined()
    expect(runBtn.hasAttribute('disabled')).toBe(true)
  })

  it('handles code security rejection', async () => {
    vi.mocked(codeSecurity.validatePythonCode).mockReturnValue({
      valid: false,
      error: 'Unsafe code detected',
    })
    const { getByRole, findByText } = render(<PythonRunner code="import os" />)
    const runBtn = getByRole('button', { name: /Run Python code/i })

    fireEvent.click(runBtn)

    const errorMsg = await findByText('Unsafe code detected')
    expect(errorMsg).toBeDefined()
    expect(mockRunPython).not.toHaveBeenCalled()
  })

  it('executes python code successfully', async () => {
    mockRunPython.mockResolvedValue({ output: 'hello\n', error: null })
    const onComplete = vi.fn()
    const { getByRole, findByText } = render(
      <PythonRunner code="print('hello')" onExecutionComplete={onComplete} />,
    )
    const runBtn = getByRole('button', { name: /Run Python code/i })

    fireEvent.click(runBtn)

    const output = await findByText('hello')
    expect(output).toBeDefined()
    expect(onComplete).toHaveBeenCalledWith({ output: 'hello\n', error: null })
  })

  it('handles execution error', async () => {
    mockRunPython.mockResolvedValue({ output: null, error: 'SyntaxError: invalid syntax' })
    const onComplete = vi.fn()
    const { getByRole, findByText } = render(
      <PythonRunner code="print('hello" onExecutionComplete={onComplete} />,
    )
    const runBtn = getByRole('button', { name: /Run Python code/i })

    fireEvent.click(runBtn)

    const errorMsg = await findByText('SyntaxError: invalid syntax')
    expect(errorMsg).toBeDefined()
    expect(onComplete).toHaveBeenCalledWith({ output: null, error: 'SyntaxError: invalid syntax' })
  })

  it('cancels execution via button', async () => {
    // Run an execution that will hang
    mockRunPython.mockImplementation(() => new Promise(() => {}))

    const { getByRole, findByRole } = render(<PythonRunner code="while True: pass" />)
    const runBtn = getByRole('button', { name: /Run Python code/i })

    fireEvent.click(runBtn)

    const cancelBtn = await findByRole('button', { name: /Cancel current Python execution/i })
    expect(cancelBtn).toBeDefined()

    fireEvent.click(cancelBtn)

    // Run button should be enabled again after cancel
    await waitFor(() => {
      expect(getByRole('button', { name: /Run Python code/i }).hasAttribute('disabled')).toBe(false)
    })
  })

  it('prevents multiple simultaneous executions', async () => {
    let resolveRun: (value: { output: string | null; error: string | null }) => void
    mockRunPython.mockReturnValue(
      new Promise((resolve) => {
        resolveRun = resolve
      }),
    )

    const { getByRole } = render(<PythonRunner code="print('hello')" />)
    const runBtn = getByRole('button', { name: /Run Python code/i })

    fireEvent.click(runBtn)
    fireEvent.click(runBtn)

    expect(mockRunPython).toHaveBeenCalledTimes(1)
    await act(async () => {
      resolveRun!({ output: 'done', error: null })
    })
  })

  it('prevents execution while pyodide is loading', () => {
    vi.mocked(usePyodideHook.usePyodide).mockReturnValue({
      loading: true,
      error: null,
      runPython: mockRunPython,
      ensureLoaded: vi.fn(),
      isReady: false,
      loadPyodide: vi.fn(),
    } as unknown as ReturnType<typeof usePyodideHook.usePyodide>)

    const { getByRole } = render(<PythonRunner code="print('hello')" />)
    const runBtn = getByRole('button', { name: /Loading Python environment.../i })

    fireEvent.click(runBtn)
    expect(mockRunPython).not.toHaveBeenCalled()
  })

  it('handles code security rejection with default message', async () => {
    vi.mocked(codeSecurity.validatePythonCode).mockReturnValue({ valid: false })
    const { getByRole, findByText } = render(<PythonRunner code="import os" />)
    const runBtn = getByRole('button', { name: /Run Python code/i })

    fireEvent.click(runBtn)

    const errorMsg = await findByText('Code rejected by security policy.')
    expect(errorMsg).toBeDefined()
  })

  it('allows imperative execution via ref', async () => {
    mockRunPython.mockResolvedValue({ output: 'ref output', error: null })
    const ref = React.createRef<PythonRunnerHandle>()
    const { findByText } = render(<PythonRunner ref={ref} code="print('ref')" />)

    act(() => {
      ref.current?.run()
    })

    const output = await findByText('ref output')
    expect(output).toBeDefined()
  })

  it('allows imperative cancellation via ref', async () => {
    mockRunPython.mockImplementation(() => new Promise(() => {}))
    const ref = React.createRef<PythonRunnerHandle>()
    const { getByRole } = render(<PythonRunner ref={ref} code="while True: pass" />)

    act(() => {
      ref.current?.run()
    })

    await waitFor(() => {
      expect(getByRole('button', { name: /Executing Python code.../i })).toBeDefined()
    })

    act(() => {
      ref.current?.cancel()
    })

    await waitFor(() => {
      expect(getByRole('button', { name: /Run Python code/i }).hasAttribute('disabled')).toBe(false)
    })
  })

  it('renders no output message when output is empty string', async () => {
    mockRunPython.mockResolvedValue({ output: '', error: null })
    const { getByRole, findByText } = render(<PythonRunner code="x = 1" />)
    const runBtn = getByRole('button', { name: /Run Python code/i })

    fireEvent.click(runBtn)

    const msg = await findByText('(no output)')
    expect(msg).toBeDefined()
  })

  it('renders compact class when compact prop is true', () => {
    const { container } = render(<PythonRunner code="x = 1" compact={true} />)
    expect((container.firstChild as HTMLElement).className).toContain('python-runner--compact')
  })

  it('ignores stale execution results when cancelled', async () => {
    let resolveRun: (value: { output: string | null; error: string | null }) => void
    mockRunPython.mockReturnValue(
      new Promise((resolve) => {
        resolveRun = resolve
      }),
    )

    const { getByRole, findByRole, queryByText } = render(<PythonRunner code="print('hello')" />)
    const runBtn = getByRole('button', { name: /Run Python code/i })

    fireEvent.click(runBtn)

    const cancelBtn = await findByRole('button', { name: /Cancel current Python execution/i })
    fireEvent.click(cancelBtn)

    await act(async () => {
      resolveRun!({ output: 'stale output', error: null })
    })

    expect(queryByText('stale output')).toBeNull()
  })
})
