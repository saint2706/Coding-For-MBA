/**
 * SQL Runner Component
 *
 * Manages the execution lifecycle of SQL scripts via sql.js (WASM SQLite).
 * Handles loading states and renders each statement's result set as a table.
 *
 * Key Responsibilities:
 * - Load sql.js lazily (via `useSqlJs` hook).
 * - Execute SQL against a fresh in-memory database on every run.
 * - Render result tables, an empty-result message, or an error.
 */

import { useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Play } from '@phosphor-icons/react'
import type { QueryExecResult, SqlValue } from 'sql.js'
import { useSqlJs, type SqlRunResult } from '../hooks/useSqlJs'

const MAX_DISPLAYED_ROWS = 200

/** Handle interface for accessing SqlRunner methods imperatively. */
export interface SqlRunnerHandle {
  run: () => Promise<void>
}

interface SqlRunnerProps {
  /** The SQL script to execute. */
  sql: string
  /**
   * Whether to render in a compact layout.
   * If true, the runner uses minimal padding, suitable for embedding in widgets.
   * Defaults to `false`.
   */
  compact?: boolean
  /** Callback fired when execution finishes, whether successful or failed. */
  onExecutionComplete?: (result: SqlRunResult) => void
}

/** Renders a single SQL value for display in a result table cell. */
function formatCell(value: SqlValue): string {
  if (value === null) return 'NULL'
  if (value instanceof Uint8Array) return `<blob: ${value.length} bytes>`
  return String(value)
}

function ResultTable({ result }: { result: QueryExecResult }) {
  const rows = result.values.slice(0, MAX_DISPLAYED_ROWS)
  const truncatedCount = result.values.length - rows.length

  return (
    <div className="sql-runner__table-wrapper">
      <table className="sql-runner__table">
        <thead>
          <tr>
            {result.columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cell === null ? 'sql-runner__cell--null' : ''}>
                  {formatCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {truncatedCount > 0 && (
        <p className="sql-runner__truncated">
          Showing first {MAX_DISPLAYED_ROWS} of {result.values.length} rows.
        </p>
      )}
    </div>
  )
}

const SqlRunner = forwardRef<SqlRunnerHandle, SqlRunnerProps>(
  ({ sql, compact = false, onExecutionComplete }, ref) => {
    const { loading: sqlJsLoading, runSql } = useSqlJs()
    const [results, setResults] = useState<QueryExecResult[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [running, setRunning] = useState(false)

    const handleRun = useCallback(async () => {
      if (running || sqlJsLoading) return

      setRunning(true)
      setResults(null)
      setError(null)

      try {
        const result = await runSql(sql)
        setResults(result.results)
        setError(result.error)
        onExecutionComplete?.(result)
      } finally {
        setRunning(false)
      }
    }, [sql, onExecutionComplete, runSql, running, sqlJsLoading])

    useImperativeHandle(ref, () => ({ run: handleRun }), [handleRun])

    const isLoading = sqlJsLoading || running

    return (
      <div className={`sql-runner ${compact ? 'sql-runner--compact' : ''}`}>
        <div className="sql-runner__controls">
          <button
            type="button"
            className="sql-runner__btn"
            onClick={handleRun}
            disabled={isLoading}
            aria-label={
              sqlJsLoading
                ? 'Loading SQL engine...'
                : running
                  ? 'Executing SQL query...'
                  : 'Run SQL query (Shift+Enter)'
            }
            title="Run (Shift+Enter)"
          >
            {sqlJsLoading ? (
              <>
                <span className="sql-runner__spinner" aria-hidden="true" />
                Loading SQL engine…
              </>
            ) : running ? (
              <>
                <span className="sql-runner__spinner" aria-hidden="true" />
                Running…
              </>
            ) : (
              <>
                <Play className="sql-runner__icon" size={16} weight="fill" aria-hidden="true" />
                Run
                <kbd className="sql-runner__shortcut">Shift+Enter</kbd>
              </>
            )}
          </button>
        </div>

        {(results !== null || error) && (
          <div className="sql-runner__output" aria-live="polite">
            <div className="sql-runner__output-header">Output</div>
            {error && <pre className="sql-runner__error">{error}</pre>}
            {results !== null && !error && results.length === 0 && (
              <pre className="sql-runner__stdout sql-runner__stdout--empty">
                Query executed successfully — no rows returned.
              </pre>
            )}
            {results !== null &&
              !error &&
              results.map((result, index) => <ResultTable key={index} result={result} />)}
          </div>
        )}
      </div>
    )
  },
)

SqlRunner.displayName = 'SqlRunner'

export default SqlRunner
