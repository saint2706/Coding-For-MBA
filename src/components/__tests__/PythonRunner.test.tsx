import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import PythonRunner from '../PythonRunner'
import * as usePyodideHook from '../../hooks/usePyodide'

// Mock usePyodide
vi.mock('../../hooks/usePyodide', () => ({
  usePyodide: vi.fn(),
}))

describe('PythonRunner', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders with correct aria-label when idle', async () => {
    vi.mocked(usePyodideHook.usePyodide).mockReturnValue({
      loading: false,
      error: null,
      runPython: vi.fn(),
      ensureLoaded: vi.fn(),
    })

    const root = createRoot(container)
    await act(async () => {
      root.render(<PythonRunner code="print('hello')" />)
    })

    const runButton = container.querySelector('button.python-runner__btn') as HTMLButtonElement
    expect(runButton).toBeTruthy()
    expect(runButton?.disabled).toBe(false)
    expect(runButton?.getAttribute('aria-label')).toBe('Run Python code (Shift+Enter)')
  })

  it('renders with correct aria-label when loading Pyodide', async () => {
    vi.mocked(usePyodideHook.usePyodide).mockReturnValue({
      loading: true,
      error: null,
      runPython: vi.fn(),
      ensureLoaded: vi.fn(),
    })

    const root = createRoot(container)
    await act(async () => {
      root.render(<PythonRunner code="print('hello')" />)
    })

    const runButton = container.querySelector('button.python-runner__btn') as HTMLButtonElement
    expect(runButton).toBeTruthy()
    expect(runButton?.disabled).toBe(true)

    expect(runButton?.getAttribute('aria-label')).toBe('Loading Python environment...')
  })
})
