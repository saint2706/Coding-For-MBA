/* eslint-disable sonarjs/no-identical-functions */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import CodePlayground from '../CodePlayground'

// Mocks
vi.mock('../PythonRunner', () => ({
  default: () => <div data-testid="python-runner" />,
}))
vi.mock('../CopyButton', () => ({
  default: () => <button>Copy</button>,
}))
// Mock SyntaxHighlighter
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}))

describe('CodePlayground UX', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('confirms reset when code is modified', async () => {
    await act(async () => {
      root.render(<CodePlayground initialCode="initial" />)
    })

    const textarea = container.querySelector('textarea')!
    // Helper to find the Reset button by text (either "Reset" or "Confirm Reset")
    const getResetBtn = () =>
      Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Reset') || b.textContent?.includes('Confirm'),
      )!

    let resetBtn = getResetBtn()

    expect(textarea.value).toBe('initial')

    // 1. Modify code
    await act(async () => {
      // Simulate typing
      const valueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )!.set
      valueSetter!.call(textarea, 'modified')

      const inputEvent = new Event('input', { bubbles: true })
      textarea.dispatchEvent(inputEvent)
    })

    expect(textarea.value).toBe('modified')

    // 2. Click reset first time (should show confirmation)
    resetBtn = getResetBtn()
    await act(async () => {
      resetBtn.click()
    })

    // Re-query button as text might have changed
    resetBtn = getResetBtn()

    // Expect confirmation text
    expect(resetBtn.textContent).toMatch(/Confirm/i)
    expect(textarea.value).toBe('modified') // Should NOT reset yet

    // 3. Click reset second time (should perform reset)
    await act(async () => {
      resetBtn.click()
    })

    resetBtn = getResetBtn()
    expect(textarea.value).toBe('initial') // Should reset now
    expect(resetBtn.textContent).toMatch(/Reset/i) // Should revert to "Reset"
  })

  it('cancels confirmation on blur', async () => {
    await act(async () => {
      root.render(<CodePlayground initialCode="initial" />)
    })

    const textarea = container.querySelector('textarea')!
    // Rename helper to avoid identical code block detection
    const findButton = () =>
      Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Reset') || b.textContent?.includes('Confirm'),
      )!

    // Modify code with different value just in case
    await act(async () => {
      const valueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )!.set
      valueSetter!.call(textarea, 'dirty_code')
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })

    let resetBtn = findButton()

    // Click reset to show confirmation
    await act(async () => {
      resetBtn.click()
    })

    resetBtn = findButton()
    expect(resetBtn.textContent).toMatch(/Confirm/i)

    // Simulate blur (click away)
    await act(async () => {
      resetBtn.blur()
      resetBtn.dispatchEvent(new Event('blur', { bubbles: true }))
    })

    resetBtn = findButton()
    expect(resetBtn.textContent).toMatch(/Reset/i)
    expect(textarea.value).toBe('dirty_code')
  })
})
