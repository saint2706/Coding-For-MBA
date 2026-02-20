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

interface RunPythonOptions {
  /**
   * Maximum time to wait for Pyodide execution before returning a timeout error.
   */
  timeoutMs?: number
  /**
   * Optional abort signal controlled by the caller.
   */
  signal?: AbortSignal
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
 * SRI Hash for the Pyodide CDN script to ensure integrity.
 *
 * This hash was generated using:
 * curl -s https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js | openssl dgst -sha384 -binary | openssl base64 -A
 *
 * When updating PYODIDE_CDN version, regenerate this hash to match the new file.
 */
const PYODIDE_SRI = 'sha384-rm4QcPMX69sqmX2kWiJa3BF02sgdJkVyATWkw5NHAxBUAvmLXhToWZYaP2wCcyEe'

/**
 * Dynamically loads a script from the specified URL.
 *
 * @param src - Script source URL
 * @returns Promise that resolves when script is loaded
 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`)

    // For Pyodide CDN, validate or enforce SRI on existing scripts
    if (src === PYODIDE_CDN && existingScript) {
      const integrity = existingScript.getAttribute('integrity')
      const crossOrigin = existingScript.getAttribute('crossorigin')

      // If existing script lacks proper SRI attributes, remove and recreate it
      if (integrity !== PYODIDE_SRI || crossOrigin !== 'anonymous') {
        existingScript.remove()
      } else {
        // Existing script has correct SRI attributes
        resolve()
        return
      }
    } else if (existingScript) {
      // For non-Pyodide scripts, accept existing script
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    if (src === PYODIDE_CDN) {
      script.integrity = PYODIDE_SRI
      script.crossOrigin = 'anonymous'
    }
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
    async (code: string, options: RunPythonOptions = {}): Promise<PyodideRunResult> => {
      const { timeoutMs, signal } = options

      try {
        if (signal?.aborted) {
          return { output: '', error: 'Execution cancelled by user.' }
        }

        const pyodide = await ensureLoaded()
        let stdout = ''
        let stderr = ''

        // Limit output size to prevent browser hang/crash (DoS)
        const MAX_OUTPUT_LENGTH = 50_000 // 50KB
        const TRUNCATION_MSG = '\n... [Output truncated due to size limit]'

        const appendOutput = (current: string, text: string): string => {
          if (current.length >= MAX_OUTPUT_LENGTH) return current
          const toAdd = text + '\n'
          if (current.length + toAdd.length > MAX_OUTPUT_LENGTH) {
            return (
              current +
              toAdd.slice(0, Math.max(0, MAX_OUTPUT_LENGTH - current.length)) +
              TRUNCATION_MSG
            )
          }
          return current + toAdd
        }

        pyodide.setStdout({
          batched: (text: string) => {
            stdout = appendOutput(stdout, text)
          },
        })
        pyodide.setStderr({
          batched: (text: string) => {
            stderr = appendOutput(stderr, text)
          },
        })

        const pythonExecutionPromise = pyodide.runPythonAsync(code)

        // NOTE: Timeout/abort cannot preempt Python code already running in Pyodide.
        // We resolve early so UI can recover, but the underlying execution may continue
        // until Pyodide yields/completes.
        const timeoutPromise =
          typeof timeoutMs === 'number'
            ? new Promise<never>((_, reject) => {
                const timeoutId = window.setTimeout(() => {
                  reject(new Error(`Python execution timed out after ${timeoutMs}ms.`))
                }, timeoutMs)
                pythonExecutionPromise
                  .finally(() => window.clearTimeout(timeoutId))
                  .catch(() => undefined)
              })
            : null

        const abortPromise = signal
          ? new Promise<never>((_, reject) => {
              const onAbort = () => {
                signal.removeEventListener('abort', onAbort)
                reject(new Error('Execution cancelled by user.'))
              }
              signal.addEventListener('abort', onAbort)
              pythonExecutionPromise
                .finally(() => signal.removeEventListener('abort', onAbort))
                .catch(() => undefined)
            })
          : null

        const result = await Promise.race([
          pythonExecutionPromise,
          ...(timeoutPromise ? [timeoutPromise] : []),
          ...(abortPromise ? [abortPromise] : []),
        ])

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
