import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import LessonCodeActions from '../LessonCodeActions'
import { toastSuccess } from '../../utils/toast'

vi.mock('../../utils/toast', () => ({
  toastSuccess: vi.fn(),
}))

describe('LessonCodeActions', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('renders nothing when the lesson has no python code blocks', () => {
    act(() => {
      root.render(<LessonCodeActions content="# Just text, no code." day="1" />)
    })

    expect(container.querySelector('.lesson-code-actions')).toBeNull()
  })

  it('copies all python snippets joined together', async () => {
    const content = '```python\nprint("a")\n```\nSome text.\n```python\nprint("b")\n```'
    act(() => {
      root.render(<LessonCodeActions content={content} day="1" />)
    })

    const copyButton = container.querySelector(
      'button[aria-label="Copy all code snippets from this lesson"]',
    )
    expect(copyButton).toBeTruthy()

    await act(async () => {
      copyButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '# --- Snippet 1 ---\nprint("a")\n\n# --- Snippet 2 ---\nprint("b")',
    )
  })

  it('downloads the combined snippets as a .py file named after the lesson day', async () => {
    const content = '```python\nprint("a")\n```'
    act(() => {
      root.render(<LessonCodeActions content={content} day="7B" />)
    })

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const downloadButton = container.querySelector(
      'button[aria-label="Download all code snippets from this lesson as a .py file"]',
    ) as HTMLButtonElement

    await act(async () => {
      downloadButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(clickSpy).toHaveBeenCalled()
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    expect(toastSuccess).toHaveBeenCalledWith('Downloaded lesson code ✓')
    clickSpy.mockRestore()
  })
})
