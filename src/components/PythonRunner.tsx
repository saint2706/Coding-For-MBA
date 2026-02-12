/**
 * PythonRunner Component
 *
 * A Python code execution component using Pyodide for in-browser Python execution.
 * Displays run button with loading states and shows execution output or errors.
 */

import { useState, useCallback } from 'react'
import { usePyodide } from '../hooks/usePyodide'

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
export default function PythonRunner({ code, compact = false }: PythonRunnerProps) {
  const { loading: pyodideLoading, runPython } = usePyodide()
  const [output, setOutput] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  /**
   * Executes the Python code and updates output/error state.
   */
  const handleRun = useCallback(async () => {
    setRunning(true)
    setOutput(null)
    setError(null)
    const result = await runPython(code)
    setOutput(result.output)
    setError(result.error)
    setRunning(false)
  }, [code, runPython])

  const isLoading = pyodideLoading || running

  return (
    <div className={`python-runner ${compact ? 'python-runner--compact' : ''}`}>
      <button
        className="python-runner__btn"
        onClick={handleRun}
        disabled={isLoading}
        aria-label="Run Python code"
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
        <div className="python-runner__output">
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
}
