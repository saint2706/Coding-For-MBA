/**
 * PythonRunner Component
 *
 * A Python code execution component using Pyodide for in-browser Python execution.
 * Displays run button with loading states and shows execution output or errors.
 */

import { useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { usePyodide } from '../hooks/usePyodide'

/**
 * Handle interface for accessing PythonRunner methods imperatively.
 */
export interface PythonRunnerHandle {
  run: () => Promise<void>
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
}

/**
 * Python code runner with Pyodide execution.
 *
 * Provides a run button that executes Python code in the browser
 * and displays the output or errors. Handles Pyodide loading state
 * and execution state with appropriate UI feedback.
 *
 * @param code - Python code to run
 * @param compact - Use compact visual layout
 * @returns A Python code runner component
 */
const PythonRunner = forwardRef<PythonRunnerHandle, PythonRunnerProps>(
  ({ code, compact = false }, ref) => {
    const { loading: pyodideLoading, runPython } = usePyodide()
    const [output, setOutput] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [running, setRunning] = useState(false)

    /**
     * Executes the Python code and updates output/error state.
     */
    const handleRun = useCallback(async () => {
      if (running || pyodideLoading) return
      setRunning(true)
      setOutput(null)
      setError(null)
      const result = await runPython(code)
      setOutput(result.output)
      setError(result.error)
      setRunning(false)
    }, [code, runPython, running, pyodideLoading])

    useImperativeHandle(ref, () => ({
      run: handleRun,
    }), [handleRun])

    const isLoading = pyodideLoading || running

    return (
      <div className={`python-runner ${compact ? 'python-runner--compact' : ''}`}>
        <button
          className="python-runner__btn"
          onClick={handleRun}
          disabled={isLoading}
          aria-label="Run Python code (Shift+Enter)"
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
            <>▶ Run</>
          )}
        </button>

        {(output !== null || error) && (
          <div className="python-runner__output" aria-live="polite">
            <div className="python-runner__output-header">Output</div>
            {error && <pre className="python-runner__error">{error}</pre>}
            {output !== null && output !== '' && (
              <pre className="python-runner__stdout">{output}</pre>
            )}
            {output === '' && !error && (
              <pre className="python-runner__stdout python-runner__stdout--empty">
                (no output)
              </pre>
            )}
          </div>
        )}
      </div>
    )
  },
)

PythonRunner.displayName = 'PythonRunner'

export default PythonRunner
