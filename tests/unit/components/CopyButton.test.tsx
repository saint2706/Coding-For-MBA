import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import CopyButton from '../../../src/components/CopyButton'

describe('CopyButton', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.useFakeTimers()

    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders correctly', () => {
    act(() => {
      root?.render(<CopyButton text="some code" />)
    })

    const button = container.querySelector('button')
    expect(button).toBeTruthy()
    expect(button?.textContent).toContain('Copy')
  })

  it('copies text to clipboard on click', async () => {
    act(() => {
      root?.render(<CopyButton text="some code" />)
    })

    const button = container.querySelector('button')

    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('some code')
  })

  it('shows feedback after copying', async () => {
    act(() => {
      root?.render(<CopyButton text="some code" />)
    })

    const button = container.querySelector('button')

    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(button?.textContent).toContain('✓ Copied')

    // Check timeout resets state
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(button?.textContent).toContain('Copy')
  })

  it('clears timeout on unmount', async () => {
    act(() => {
      root?.render(<CopyButton text="some code" />)
    })

    const button = container.querySelector('button')

    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(button?.textContent).toContain('✓ Copied')

    // Unmount before timeout finishes
    act(() => {
      root?.unmount()
      root = undefined // Prevent double unmount in afterEach
    })

    // Ensure no errors or state updates on unmounted component
    act(() => {
      vi.advanceTimersByTime(2000)
    })
  })

  it('handles multiple clicks by clearing previous timeout', async () => {
    act(() => {
      root?.render(<CopyButton text="some code" />)
    })

    const button = container.querySelector('button')

    // First click
    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(button?.textContent).toContain('✓ Copied')

    // Advance time slightly
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Second click
    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Should still be copied
    expect(button?.textContent).toContain('✓ Copied')

    // Advance 1500ms (total 2500ms from start, but only 1500ms from second click)
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    // Should NOT have reset yet because timeout was reset
    expect(button?.textContent).toContain('✓ Copied')

    // Advance remaining 500ms
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(button?.textContent).toContain('Copy')
  })

  it('logs error when copy fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Copy failed'))

    act(() => {
      root?.render(<CopyButton text="some code" />)
    })

    const button = container.querySelector('button')

    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy text to clipboard', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('renders an icon when showIcon is true', () => {
    act(() => {
      root?.render(<CopyButton text="some code" showIcon />)
    })

    const button = container.querySelector('button')
    expect(button?.querySelector('svg')).toBeTruthy()
    expect(button?.textContent).toContain('Copy')
  })

  it('renders a custom label when provided', () => {
    act(() => {
      root?.render(<CopyButton text="some code" label="Copy all snippets" />)
    })

    const button = container.querySelector('button')
    expect(button?.textContent).toContain('Copy all snippets')
  })

  it('renders a custom label alongside the icon', () => {
    act(() => {
      root?.render(<CopyButton text="some code" showIcon label="Copy starter code" />)
    })

    const button = container.querySelector('button')
    expect(button?.querySelector('svg')).toBeTruthy()
    expect(button?.textContent).toContain('Copy starter code')
  })
})
