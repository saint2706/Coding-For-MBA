import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { createRef, act, forwardRef, useImperativeHandle } from 'react'
import { createRoot } from 'react-dom/client'
import CodePlayground, { CodePlaygroundHandle } from '../CodePlayground'

// Mock PythonRunner with ref support
const mockRunFn = vi.fn()

interface MockPythonRunnerProps {
  code: string
  compact?: boolean
}

vi.mock('../PythonRunner', () => ({
  default: forwardRef((_props: MockPythonRunnerProps, ref: React.Ref<unknown>) => {
    useImperativeHandle(ref, () => ({
      run: mockRunFn,
      cancel: vi.fn(),
    }))
    return <div data-testid="python-runner" />
  }),
}))

vi.mock('../CopyButton', () => ({
  default: () => <button>Copy</button>,
}))

// Mock SyntaxHighlighter because it might use canvas or complex DOM
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: React.ReactNode }) => (
    <div className="syntax-highlighter">{children}</div>
  ),
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}))

describe('CodePlayground Ref', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    mockRunFn.mockClear()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('exposes setCode via ref', async () => {
    const ref = createRef<CodePlaygroundHandle>()
    const root = createRoot(container)

    await act(async () => {
      root.render(<CodePlayground initialCode="initial" ref={ref} />)
    })

    // Check initial render
    const textarea = container.querySelector('textarea')
    expect(textarea?.value).toBe('initial')

    // Update code via ref
    await act(async () => {
      ref.current?.setCode('updated')
    })

    expect(textarea?.value).toBe('updated')

    // Reset code via ref
    await act(async () => {
      ref.current?.reset()
    })

    expect(textarea?.value).toBe('initial')
  })

  it('exposes run via ref and calls PythonRunner run method', async () => {
    const ref = createRef<CodePlaygroundHandle>()
    const root = createRoot(container)

    await act(async () => {
      root.render(<CodePlayground initialCode="print('test')" ref={ref} />)
    })

    // Call run via ref
    await act(async () => {
      ref.current?.run()
    })

    // Verify that PythonRunner's run method was called
    expect(mockRunFn).toHaveBeenCalledTimes(1)
  })
})
