import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useState } from 'react'
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

/**
 * `KeyboardShortcutsOverlay` is a controlled component: `isOpen` is owned by
 * its parent (`App`), and the component reports its own `?` keyboard
 * trigger via `onOpen` rather than managing local state. This harness
 * mirrors that contract the same way `App` does, so the existing
 * keyboard-driven behavior (open via `?`, close via Esc/backdrop/button)
 * can still be exercised end-to-end.
 */
function ControlledHarness() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <KeyboardShortcutsOverlay
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    />
  )
}

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

  it('renders nothing when isOpen is false', () => {
    act(() => {
      root?.render(<KeyboardShortcutsOverlay isOpen={false} onOpen={vi.fn()} onClose={vi.fn()} />)
    })
    expect(container.innerHTML).toBe('')
  })

  it('renders the dialog when isOpen is true', () => {
    act(() => {
      root?.render(<KeyboardShortcutsOverlay isOpen={true} onOpen={vi.fn()} onClose={vi.fn()} />)
    })

    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(dialog?.textContent).toContain('Keyboard shortcuts')
    expect(dialog?.textContent).toContain('Global')
    expect(dialog?.textContent).toContain('Search')
  })

  it('calls onOpen when ? is pressed (standalone, not just via the palette)', () => {
    vi.mocked(shortcutsUtils.isTypingInEditableElement).mockReturnValue(false)

    act(() => {
      root?.render(<ControlledHarness />)
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
    })

    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(dialog?.textContent).toContain('Keyboard shortcuts')
  })

  it('does not open when typing in input', () => {
    vi.mocked(shortcutsUtils.isTypingInEditableElement).mockReturnValue(true)

    act(() => {
      root?.render(<ControlledHarness />)
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
      root?.render(<ControlledHarness />)
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
      root?.render(<ControlledHarness />)
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
      root?.render(<ControlledHarness />)
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

  it('opens when isOpen becomes true externally (e.g. triggered by the command palette)', () => {
    act(() => {
      root?.render(<KeyboardShortcutsOverlay isOpen={false} onOpen={vi.fn()} onClose={vi.fn()} />)
    })
    expect(container.querySelector('[role="dialog"]')).toBeNull()

    act(() => {
      root?.render(<KeyboardShortcutsOverlay isOpen={true} onOpen={vi.fn()} onClose={vi.fn()} />)
    })

    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
  })

  it('calls onClose (not a local setter) when closed via Esc while externally controlled', () => {
    const onClose = vi.fn()

    act(() => {
      root?.render(<KeyboardShortcutsOverlay isOpen={true} onOpen={vi.fn()} onClose={onClose} />)
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(onClose).toHaveBeenCalled()
  })

  it('traps focus correctly', () => {
    vi.mocked(shortcutsUtils.isTypingInEditableElement).mockReturnValue(false)

    act(() => {
      root?.render(<ControlledHarness />)
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
