/**
 * Pyodide (Python Runtime) Hook
 * 
 * Manages the Pyodide WebAssembly Python runtime for executing Python code
 * in the browser. Handles lazy loading, singleton instance management, and
 * code execution with output capture.
 */

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Result of executing Python code.
 */
interface PyodideRunResult {
  /** Standard output from the Python execution */
  output: string
  /** Error message if execution failed, otherwise null */
  error: string | null
}

/**
 * Interface for the Pyodide runtime instance.
 */
interface PyodideInterface {
  runPythonAsync(code: string): Promise<unknown>
  setStdout(opts: { batched: (text: string) => void }): void
  setStderr(opts: { batched: (text: string) => void }): void
}

/**
 * Extends the Window interface with Pyodide-related properties.
 */
declare global {
  interface Window {
    loadPyodide?: () => Promise<PyodideInterface>
    _pyodideInstance?: PyodideInterface
    _pyodideLoading?: Promise<PyodideInterface>
  }
}

/**
 * CDN URL for the Pyodide WebAssembly runtime.
 */
const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js'

/**
 * Dynamically loads a script from the specified URL.
 * 
 * @param src - Script source URL
 * @returns Promise that resolves when script is loaded
 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load Pyodide from CDN`))
    document.head.appendChild(script)
  })
}

/**
 * Initializes the Pyodide runtime as a singleton instance.
 * 
 * Ensures only one instance of Pyodide is loaded globally, even if
 * multiple components try to initialize it simultaneously. Uses
 * promise deduplication to prevent redundant loading.
 * 
 * @returns Promise resolving to the Pyodide instance
 */
async function initPyodide(): Promise<PyodideInterface> {
  // Singleton: return existing instance
  if (window._pyodideInstance) return window._pyodideInstance

  // Dedup: return in-flight promise if already loading
  if (window._pyodideLoading) return window._pyodideLoading

  window._pyodideLoading = (async () => {
    await loadScript(PYODIDE_CDN)
    if (!window.loadPyodide) throw new Error('Pyodide script loaded but loadPyodide not found')
    const pyodide = await window.loadPyodide()
    window._pyodideInstance = pyodide
    return pyodide
  })()

  try {
    return await window._pyodideLoading
  } catch (err) {
    window._pyodideLoading = undefined
    throw err
  }
}

/**
 * Custom hook for managing Pyodide Python runtime.
 * 
 * Provides a managed interface to the Pyodide WebAssembly Python runtime,
 * handling lazy initialization, loading state, and code execution with
 * output/error capture. The runtime is shared as a singleton across all
 * hook instances.
 * 
 * @returns Object containing loading state, error state, and execution functions
 * 
 * @example
 * ```tsx
 * const { loading, error, runPython } = usePyodide()
 * 
 * const handleRun = async () => {
 *   const result = await runPython('print("Hello, World!")')
 *   console.log(result.output) // "Hello, World!"
 * }
 * ```
 */
export function usePyodide() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pyodideRef = useRef<PyodideInterface | null>(window._pyodideInstance ?? null)
  const initStarted = useRef(false)

  const ensureLoaded = useCallback(async () => {
    if (pyodideRef.current) return pyodideRef.current
    if (initStarted.current) {
      // Wait for the in-flight init
      const instance = await initPyodide()
      pyodideRef.current = instance
      return instance
    }
    initStarted.current = true
    setLoading(true)
    setError(null)
    try {
      const instance = await initPyodide()
      pyodideRef.current = instance
      return instance
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load Python runtime'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // If already loaded globally, sync ref
  useEffect(() => {
    if (window._pyodideInstance && !pyodideRef.current) {
      pyodideRef.current = window._pyodideInstance
    }
  }, [])

  const runPython = useCallback(
    async (code: string): Promise<PyodideRunResult> => {
      try {
        const pyodide = await ensureLoaded()
        let stdout = ''
        let stderr = ''
        pyodide.setStdout({ batched: (text: string) => (stdout += text + '\n') })
        pyodide.setStderr({ batched: (text: string) => (stderr += text + '\n') })

        const result = await pyodide.runPythonAsync(code)

        // If there's a return value and no stdout, show the return value
        let output = stdout.trimEnd()
        if (!output && result !== undefined && result !== null) {
          output = String(result)
        }

        return { output, error: stderr.trimEnd() || null }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        return { output: '', error: msg }
      }
    },
    [ensureLoaded],
  )

  return { loading, error, runPython, ensureLoaded }
}
