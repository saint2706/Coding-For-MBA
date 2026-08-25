import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { act, forwardRef, useImperativeHandle } from 'react'
import { createRoot } from 'react-dom/client'
import SqlPlayground from '../../../src/components/SqlPlayground'

vi.mock('../../../src/components/CopyButton', () => ({
  default: () => <button>Copy</button>,
}))

vi.mock('../../../src/utils/prism', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div className="syntax-highlighter">{children}</div>
  ),
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}))

let capturedSql: string | undefined
const mockRunFn = vi.fn()

interface MockSqlRunnerProps {
  sql: string
}

vi.mock('../../../src/components/SqlRunner', () => ({
  default: forwardRef((props: MockSqlRunnerProps, ref: React.Ref<unknown>) => {
    capturedSql = props.sql
    useImperativeHandle(ref, () => ({ run: mockRunFn }))
    return <div data-testid="sql-runner" />
  }),
}))

describe('SqlPlayground Interactions', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    mockRunFn.mockClear()
    capturedSql = undefined
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('updates code when typing in the textarea and forwards it to SqlRunner', async () => {
    await act(async () => {
      root.render(<SqlPlayground initialCode="SELECT 1;" />)
    })

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe('SELECT 1;')
    expect(capturedSql).toBe('SELECT 1;')

    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set
      nativeInputValueSetter?.call(textarea, 'SELECT 2;')
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })

    expect(textarea.value).toBe('SELECT 2;')
    expect(capturedSql).toBe('SELECT 2;')
  })

  it('resets code with confirmation', async () => {
    vi.useFakeTimers()
    await act(async () => {
      root.render(<SqlPlayground initialCode="SELECT 1;" />)
    })

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement

    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set
      nativeInputValueSetter?.call(textarea, 'SELECT 2;')
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(textarea.value).toBe('SELECT 2;')

    const resetButton = container.querySelector('.code-playground__btn--reset') as HTMLButtonElement
    expect(resetButton.textContent).toContain('Reset')

    await act(async () => {
      resetButton.click()
    })
    expect(resetButton.textContent).toContain('Confirm?')

    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(resetButton.textContent).toContain('Reset')

    await act(async () => {
      resetButton.click()
    })
    expect(resetButton.textContent).toContain('Confirm?')

    await act(async () => {
      resetButton.click()
    })

    expect(textarea.value).toBe('SELECT 1;')
    expect(resetButton.textContent).toContain('Reset')
    vi.useRealTimers()
  })

  it('runs code on Shift+Enter', async () => {
    await act(async () => {
      root.render(<SqlPlayground initialCode="SELECT 1;" />)
    })

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement

    await act(async () => {
      textarea.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }),
      )
    })

    expect(mockRunFn).toHaveBeenCalled()
  })
})
