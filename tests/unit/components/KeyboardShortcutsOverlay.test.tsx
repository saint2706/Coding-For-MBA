import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import KeyboardShortcutsOverlay from '../../../src/components/KeyboardShortcutsOverlay'
import * as shortcutsUtils from '../../../src/utils/shortcuts'

vi.mock('../../../src/utils/shortcuts', () => ({
  SHORTCUTS: [
    { scope: 'Global', keys: '?', description: 'Show shortcuts' },
    { scope: 'Search', keys: '/', description: 'Search' },
  ],
  isTypingInEditableElement: vi.fn(),
}))

describe('KeyboardShortcutsOverlay', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('renders nothing initially', () => {
    act(() => {
      root?.render(<KeyboardShortcutsOverlay />)
    })
    expect(container.innerHTML).toBe('')
  })

  it('opens when ? is pressed', () => {
    vi.mocked(shortcutsUtils.isTypingInEditableElement).mockReturnValue(false)

    act(() => {
      root?.render(<KeyboardShortcutsOverlay />)
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
    })

    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(dialog?.textContent).toContain('Keyboard shortcuts')
    expect(dialog?.textContent).toContain('Global')
    expect(dialog?.textContent).toContain('Search')
  })

  it('does not open when typing in input', () => {
    vi.mocked(shortcutsUtils.isTypingInEditableElement).mockReturnValue(true)

    act(() => {
      root?.render(<KeyboardShortcutsOverlay />)
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
    })

    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeNull()
  })

  it('closes when Esc is pressed', () => {
    vi.mocked(shortcutsUtils.isTypingInEditableElement).mockReturnValue(false)

    act(() => {
      root?.render(<KeyboardShortcutsOverlay />)
    })

    // Open it
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
    })

    let dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()

    // Close it
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeNull()
  })

  it('closes when close button is clicked', () => {
    vi.mocked(shortcutsUtils.isTypingInEditableElement).mockReturnValue(false)

    act(() => {
      root?.render(<KeyboardShortcutsOverlay />)
    })

    // Open it
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
    })

    const closeBtn = container.querySelector('.shortcut-overlay-close') as HTMLButtonElement

    act(() => {
      closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeNull()
  })

  it('closes when backdrop is clicked', () => {
    vi.mocked(shortcutsUtils.isTypingInEditableElement).mockReturnValue(false)

    act(() => {
      root?.render(<KeyboardShortcutsOverlay />)
    })

    // Open it
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
    })

    const backdrop = container.querySelector('.shortcut-overlay-backdrop') as HTMLDivElement

    act(() => {
      // simulate clicking directly on backdrop
      const ev = new MouseEvent('click', { bubbles: true })
      Object.defineProperty(ev, 'target', { value: backdrop })
      Object.defineProperty(ev, 'currentTarget', { value: backdrop })
      backdrop.dispatchEvent(ev)
    })

    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeNull()
  })

  it('traps focus correctly', () => {
    vi.mocked(shortcutsUtils.isTypingInEditableElement).mockReturnValue(false)

    act(() => {
      root?.render(<KeyboardShortcutsOverlay />)
    })

    // Open it
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
    })

    const closeBtn = container.querySelector('.shortcut-overlay-close') as HTMLButtonElement

    // Active element should be close button upon opening
    expect(document.activeElement).toBe(closeBtn)

    // Attempting to tab forward from last element should wrap around
    // In our simplified mock, closeBtn is both first and last focusable element
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    })

    // It should still be focused
    expect(document.activeElement).toBe(closeBtn)

    // Attempting to tab backward should wrap around
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }))
    })

    // It should still be focused
    expect(document.activeElement).toBe(closeBtn)
  })
})
