/**
 * PythonRunner Component
 *
 * A Python code execution component using Pyodide for in-browser Python execution.
 * Displays run button with loading states and shows execution output or errors.
 */

import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import { usePyodide } from '../hooks/usePyodide'
import { validatePythonCode } from '../utils/codeSecurity'

const DEFAULT_RUN_TIMEOUT_MS = 10_000

/**
 * Handle interface for accessing PythonRunner methods imperatively.
 */
export interface PythonRunnerHandle {
  run: () => Promise<void>
  cancel: () => void
}

/**
 * Props for the PythonRunner component.
 *
 * @property code - Python code to execute
 * @property compact - Whether to use compact layout (default: false)
 */
interface PythonRunnerProps {
  code: string
  compact?: boolean
  onExecutionComplete?: (result: { output: string | null; error: string | null }) => void
}

/**
 * Python code runner with Pyodide execution.
 *
 * Provides a run button that executes Python code in the browser
 * and displays the output or errors. Handles Pyodide loading state
 * and execution state with appropriate UI feedback.
 *
 * Maintainer note: cancellation/timeout are UI-level controls that race the
 * Promise returned by `runPythonAsync`. Pyodide does not get forcefully
 * interrupted here, so long-running code may continue in the background until
 * execution yields. We guard state updates to prevent stale results from
 * clobbering newer runs.
 *
 * @param code - Python code to run
 * @param compact - Use compact visual layout
 * @returns A Python code runner component
 */
const PythonRunner = forwardRef<PythonRunnerHandle, PythonRunnerProps>(
  ({ code, compact = false, onExecutionComplete }, ref) => {
    const { loading: pyodideLoading, runPython } = usePyodide()
    const [output, setOutput] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [running, setRunning] = useState(false)
    const runIdRef = useRef(0)
    const abortControllerRef = useRef<AbortController | null>(null)

    const cancelRun = useCallback(() => {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
      setRunning(false)
    }, [])

    /**
     * Executes the Python code and updates output/error state.
     */
    const handleRun = useCallback(async () => {
      if (running || pyodideLoading) return

      // Security Check
      const { valid, error: validationError } = validatePythonCode(code)
      if (!valid) {
        setError(validationError || 'Code rejected by security policy.')
        setOutput(null)
        return
      }

      const currentRunId = runIdRef.current + 1
      runIdRef.current = currentRunId
      const abortController = new AbortController()
      abortControllerRef.current = abortController
      setRunning(true)
      setOutput(null)
      setError(null)

      try {
        const result = await runPython(code, {
          timeoutMs: DEFAULT_RUN_TIMEOUT_MS,
          signal: abortController.signal,
        })

        // Ignore stale resolution from runs that were superseded/cancelled.
        if (runIdRef.current !== currentRunId) return
        setOutput(result.output)
        setError(result.error)
        onExecutionComplete?.({ output: result.output, error: result.error })
      } finally {
        if (runIdRef.current === currentRunId) {
          abortControllerRef.current = null
          setRunning(false)
        }
      }
    }, [code, onExecutionComplete, runPython, running, pyodideLoading])

    useImperativeHandle(
      ref,
      () => ({
        run: handleRun,
        cancel: cancelRun,
      }),
      [cancelRun, handleRun],
    )

    const isLoading = pyodideLoading || running

    return (
      <div className={`python-runner ${compact ? 'python-runner--compact' : ''}`}>
        <div className="python-runner__controls">
          <button
            className="python-runner__btn"
            onClick={handleRun}
            disabled={isLoading}
            aria-label={
              pyodideLoading
                ? 'Loading Python environment...'
                : running
                  ? 'Executing Python code...'
                  : 'Run Python code (Shift+Enter)'
            }
            title="Run (Shift+Enter)"
          >
            {pyodideLoading ? (
              <>
                <span className="python-runner__spinner" aria-hidden="true" />
                Loading Python…
              </>
            ) : running ? (
              <>
                <span className="python-runner__spinner" aria-hidden="true" />
                Running…
              </>
            ) : (
              <>
                <svg
                  className="python-runner__icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run
                <kbd className="python-runner__shortcut">Shift+Enter</kbd>
              </>
            )}
          </button>

          {running && (
            <button
              className="python-runner__btn python-runner__btn--cancel"
              onClick={cancelRun}
              aria-label="Cancel current Python execution"
              title="Cancel execution"
            >
              ✕ Cancel
            </button>
          )}
        </div>

        {(output !== null || error) && (
          <div className="python-runner__output" aria-live="polite">
            <div className="python-runner__output-header">Output</div>
            {error && <pre className="python-runner__error">{error}</pre>}
            {output !== null && output !== '' && (
              <pre className="python-runner__stdout">{output}</pre>
            )}
            {output === '' && !error && (
              <pre className="python-runner__stdout python-runner__stdout--empty">(no output)</pre>
            )}
          </div>
        )}
      </div>
    )
  },
)

PythonRunner.displayName = 'PythonRunner'

export default PythonRunner
