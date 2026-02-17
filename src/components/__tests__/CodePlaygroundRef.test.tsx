import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { createRef, act } from 'react'
import { createRoot } from 'react-dom/client'
import CodePlayground, { CodePlaygroundHandle } from '../CodePlayground'

// Mock sub-components to simplify testing
vi.mock('../PythonRunner', () => ({
  default: () => <div data-testid="python-runner" />
}))

vi.mock('../CopyButton', () => ({
  default: () => <button>Copy</button>
}))

// Mock SyntaxHighlighter because it might use canvas or complex DOM
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: React.ReactNode }) => <div className="syntax-highlighter">{children}</div>
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {}
}))

describe('CodePlayground Ref', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
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
})
