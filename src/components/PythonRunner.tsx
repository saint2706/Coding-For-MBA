/**
 * Python Runner Component
 *
 * Manages the execution lifecycle of Python code via Pyodide.
 * Handles loading states, security validation, execution timeouts, and result display.
 *
 * Key Responsibilities:
 * - Load Pyodide lazily (via `usePyodide` hook).
 * - Validate code against security rules before execution.
 * - Manage execution state (running, loading, error, success).
 * - Render execution controls (Run/Cancel) and output console.
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

interface PythonRunnerProps {
  /** The Python source code to execute. */
  code: string
  /**
   * Whether to render in a compact layout.
   * If true, the runner uses minimal padding and smaller fonts, suitable for embedding in widgets.
   * Defaults to `false`.
   */
  compact?: boolean
  /**
   * Callback fired when execution finishes, whether successful or failed.
   *
   * @param result - An object containing the standard output (`output`) or error message (`error`).
   */
  onExecutionComplete?: (result: { output: string | null; error: string | null }) => void
}

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
            type="button"
            className="python-runner__btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
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
              type="button"
              className="python-runner__btn python-runner__btn--cancel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
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

/**
 * Python Runner Component
 *
 * Manages the execution lifecycle of Python code via Pyodide.
 * Handles loading states, security validation, execution timeouts, and result display.
 *
 * @param {PythonRunnerProps} props - The component props.
 * @param {string} props.code - The Python source code to execute.
 * @param {boolean} [props.compact=false] - Whether to render in a compact layout.
 * @param {(result: { output: string | null; error: string | null }) => void} [props.onExecutionComplete] - Callback fired when execution finishes.
 * @param {React.Ref<PythonRunnerHandle>} ref - React ref for imperative access.
 * @returns {JSX.Element} The rendered PythonRunner component.
 */
export default PythonRunner
