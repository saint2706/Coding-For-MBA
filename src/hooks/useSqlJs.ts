/**
 * sql.js Runtime Hook
 *
 * Manages the sql.js (WASM SQLite) runtime for executing SQL in the browser.
 * Handles lazy loading, singleton management, and per-run database instances.
 *
 * Key Responsibilities:
 * - Load the sql.js WASM module lazily, sharing a single in-flight promise.
 * - Provide a `runSql` interface that executes SQL against a fresh in-memory
 *   database and returns the resulting row sets.
 */

import { useState, useRef, useCallback } from 'react'
import initSqlJs, { type Database, type QueryExecResult, type SqlJsStatic } from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

/** Result of executing a SQL script against an in-memory database. */
export interface SqlRunResult {
  /** One entry per statement that produced rows (SELECT, etc.). */
  results: QueryExecResult[]
  /** Error message if execution failed, otherwise null. */
  error: string | null
}

let sqlJsPromise: Promise<SqlJsStatic> | null = null

/** Load the sql.js WASM module once, sharing the in-flight promise across hook instances. */
function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({ locateFile: () => sqlWasmUrl })
  }
  return sqlJsPromise
}

/**
 * Custom hook for managing the sql.js (WASM SQLite) runtime.
 *
 * Each call to `runSql` creates a fresh in-memory database, executes the
 * given SQL script against it, and closes it afterwards — so playgrounds
 * never see state left over from a previous run.
 *
 * @returns Object containing loading state and the `runSql` execution function.
 */
export function useSqlJs() {
  const [loading, setLoading] = useState(false)
  const sqlRef = useRef<SqlJsStatic | null>(null)

  const ensureLoaded = useCallback(async () => {
    if (sqlRef.current) return sqlRef.current
    setLoading(true)
    try {
      const SQL = await loadSqlJs()
      sqlRef.current = SQL
      return SQL
    } finally {
      setLoading(false)
    }
  }, [])

  const runSql = useCallback(
    async (sql: string): Promise<SqlRunResult> => {
      let db: Database | null = null
      try {
        const SQL = await ensureLoaded()
        db = new SQL.Database()
        const results = db.exec(sql)
        return { results, error: null }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        return { results: [], error: msg }
      } finally {
        db?.close()
      }
    },
    [ensureLoaded],
  )

  return { loading, runSql }
}
