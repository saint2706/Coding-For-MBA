import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { usePyodide } from '../usePyodide'

// Mock global window properties for Pyodide
interface MockPyodide {
  runPythonAsync: (code: string) => Promise<unknown>
  setStdout: (opts: { batched: (text: string) => void }) => void
  setStderr: (opts: { batched: (text: string) => void }) => void
}

declare global {
  interface Window {
    loadPyodide?: () => Promise<MockPyodide>
    _pyodideInstance?: MockPyodide
    _pyodideLoading?: Promise<MockPyodide>
    __stdoutCallback?: (text: string) => void
    __stderrCallback?: (text: string) => void
  }
}

describe('usePyodide', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()

    // Mock script loading mechanism
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'script') {
        const script = originalCreateElement('script') as HTMLScriptElement
        // Simulate async load
        setTimeout(() => {
          // Define loadPyodide before invoking onload
          window.loadPyodide = vi.fn().mockResolvedValue({
            runPythonAsync: vi.fn().mockImplementation(async (code) => {
              // Simulate output larger than 50KB limit
              if (code.includes('print_large')) {
                const chunk1 = 'a'.repeat(30000)
                const chunk2 = 'b'.repeat(30000)
                // Use the captured callback
                if (window.__stdoutCallback) {
                  window.__stdoutCallback(chunk1)
                  window.__stdoutCallback(chunk2)
                }
                return undefined
              }
              if (code.includes('raise_error')) {
                throw new Error('Python Error')
              }
              if (code.includes('print_hello')) {
                if (window.__stdoutCallback) window.__stdoutCallback('Hello World')
                return undefined
              }
              if (code.includes('return_value')) {
                return 'Returned Value'
              }
              return 'result'
            }),
            setStdout: vi.fn().mockImplementation(({ batched }) => {
              window.__stdoutCallback = batched
            }),
            setStderr: vi.fn().mockImplementation(({ batched }) => {
              window.__stderrCallback = batched
            }),
          })

          script.onload?.(new Event('load'))
        }, 10)
        return script
      }
      return originalCreateElement(tagName)
    })
  })

  afterEach(() => {
    if (root) {
      const r = root
      act(() => r.unmount())
    }
    document.body.removeChild(container)
    vi.restoreAllMocks()
    delete window.loadPyodide
    delete window._pyodideInstance
    delete window._pyodideLoading
    delete window.__stdoutCallback
    delete window.__stderrCallback
  })

  it('runs python code successfully and captures output', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hookResult: any

    function TestComponent() {
      hookResult = usePyodide()
      return null
    }

    await act(async () => {
      if (root) {
        root.render(<TestComponent />)
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any
    await act(async () => {
      result = await hookResult.runPython('print_hello')
    })

    expect(result.output).toBe('Hello World')
    expect(result.error).toBeNull()
  })

  it('handles python errors gracefully', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hookResult: any

    function TestComponent() {
      hookResult = usePyodide()
      return null
    }

    await act(async () => {
      if (root) {
        root.render(<TestComponent />)
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any
    await act(async () => {
      result = await hookResult.runPython('raise_error')
    })

    expect(result.error).toBe('Python Error')
    expect(result.output).toBe('')
  })

  it('truncates output when it exceeds the limit', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hookResult: any

    function TestComponent() {
      hookResult = usePyodide()
      return null
    }

    await act(async () => {
      if (root) {
        root.render(<TestComponent />)
      }
    })

    // Trigger runPython
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any
    await act(async () => {
      result = await hookResult.runPython('print_large')
    })

    // Expect output to be truncated
    // 30000 'a' + '\n' + 30000 'b' + '\n' = 60002 chars
    // Limit is 50000 (assumed)
    // Check if output contains truncation message
    expect(result.output).toContain('[Output truncated due to size limit]')
    expect(result.output.length).toBeLessThan(60000)
  })

  it('returns the return value if no stdout', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hookResult: any

    function TestComponent() {
      hookResult = usePyodide()
      return null
    }

    await act(async () => {
      if (root) {
        root.render(<TestComponent />)
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any
    await act(async () => {
      result = await hookResult.runPython('return_value')
    })

    expect(result.output).toBe('Returned Value')
  })

  it('handles timeout', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hookResult: any

    function TestComponent() {
      hookResult = usePyodide()
      return null
    }

    await act(async () => {
      if (root) {
        root.render(<TestComponent />)
      }
    })

    // Ensure loaded so we can modify the instance
    await act(async () => {
      await hookResult.ensureLoaded()
    })

    // Simulate runPythonAsync taking longer than timeout
    const originalRunPythonAsync = window._pyodideInstance?.runPythonAsync
    if (window._pyodideInstance) {
      window._pyodideInstance.runPythonAsync = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return 'done'
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any
    await act(async () => {
      // Small timeout
      result = await hookResult.runPython('sleep', { timeoutMs: 10 })
    })

    expect(result.error).toContain('Python execution timed out')

    // Restore
    if (window._pyodideInstance && originalRunPythonAsync) {
      window._pyodideInstance.runPythonAsync = originalRunPythonAsync
    }
  })

  it('handles abort signal', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hookResult: any

    function TestComponent() {
      hookResult = usePyodide()
      return null
    }

    await act(async () => {
      if (root) {
        root.render(<TestComponent />)
      }
    })

    // Ensure loaded so we can modify the instance
    await act(async () => {
      await hookResult.ensureLoaded()
    })

    // Simulate runPythonAsync taking time
    const originalRunPythonAsync = window._pyodideInstance?.runPythonAsync
    if (window._pyodideInstance) {
      window._pyodideInstance.runPythonAsync = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return 'done'
      }
    }

    const controller = new AbortController()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resultPromise: Promise<any>

    // Start execution
    resultPromise = hookResult.runPython('sleep', { signal: controller.signal })

    // Abort immediately
    controller.abort()

    const result = await resultPromise
    expect(result.error).toBe('Execution cancelled by user.')

    // Restore
    if (window._pyodideInstance && originalRunPythonAsync) {
      window._pyodideInstance.runPythonAsync = originalRunPythonAsync
    }
  })
})
