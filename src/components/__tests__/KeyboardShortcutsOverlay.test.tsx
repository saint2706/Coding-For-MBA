import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import KeyboardShortcutsOverlay from '../KeyboardShortcutsOverlay'

describe('KeyboardShortcutsOverlay', () => {
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

  it('opens with ? and renders grouped shortcuts', async () => {
    await act(async () => {
      root.render(<KeyboardShortcutsOverlay />)
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
    })

    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(container.textContent).toContain('Keyboard shortcuts')
    expect(container.textContent).toContain('Global')
    expect(container.textContent).toContain('Search')
    expect(container.textContent).toContain('Lesson')
  })

  it('does not open when typing and closes with Escape', async () => {
    await act(async () => {
      root.render(
        <>
          <input aria-label="editor" />
          <KeyboardShortcutsOverlay />
        </>,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement
    input.focus()

    await act(async () => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }))
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })
})
