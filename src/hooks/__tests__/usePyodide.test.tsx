import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { usePyodide } from '../usePyodide'

// Mock global window properties for Pyodide
declare global {
  interface Window {
    loadPyodide?: any
    _pyodideInstance?: any
    _pyodideLoading?: any
    __stdoutCallback?: (text: string) => void
  }
}

describe('usePyodide Output Limit', () => {
  let container: HTMLDivElement
  let root: any

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
              if (code === 'print_large') {
                const chunk1 = 'a'.repeat(30000)
                const chunk2 = 'b'.repeat(30000)
                // Use the captured callback
                if (window.__stdoutCallback) {
                  window.__stdoutCallback(chunk1)
                  window.__stdoutCallback(chunk2)
                }
                return undefined
              }
              return "result"
            }),
            setStdout: vi.fn().mockImplementation(({ batched }) => {
              window.__stdoutCallback = batched
            }),
            setStderr: vi.fn(),
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
        act(() => root.unmount())
    }
    document.body.removeChild(container)
    vi.restoreAllMocks()
    delete window.loadPyodide
    delete window._pyodideInstance
    delete window._pyodideLoading
    delete window.__stdoutCallback
  })

  it('truncates output when it exceeds the limit', async () => {
    let hookResult: any

    function TestComponent() {
      hookResult = usePyodide()
      return null
    }

    await act(async () => {
      root.render(<TestComponent />)
    })

    // Trigger runPython
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
    // Actually, expect length to be around 50000 + message length
    // Wait, my logic cuts strictly at MAX_OUTPUT_LENGTH?
    // Yes: stdout.slice(0, MAX_OUTPUT_LENGTH) + TRUNCATION_MSG
  })
})
