/**
 * Keyboard Shortcuts Overlay
 *
 * A modal dialog displaying all available keyboard shortcuts.
 *
 * Key Responsibilities:
 * - List all shortcuts grouped by scope (Global, Search, Lesson).
 * - Handle opening via its own keyboard listener (`?`) or an external
 *   trigger (e.g. the command palette), and closing via keyboard or mouse.
 * - Manage focus trap within the dialog.
 *
 * `isOpen` is owned by the parent (`App`) rather than this component so
 * other UI — namely `SearchPalette`'s "Open keyboard shortcuts" quick
 * action — can open the overlay too. This component still owns its `?`
 * keyboard trigger; it just reports the request via `onOpen` instead of
 * flipping local state.
 */

import { useEffect, useMemo, useRef } from 'react'
import { SHORTCUTS, isTypingInEditableElement, type ShortcutDefinition } from '../utils/shortcuts'

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Props for the KeyboardShortcutsOverlay component.
 *
 * @property isOpen - Whether the overlay is visible (owned by the parent).
 * @property onOpen - Called when the overlay's own `?` shortcut fires.
 * @property onClose - Called to close the overlay (Esc, backdrop, close button).
 */
interface KeyboardShortcutsOverlayProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

/**
 * Keyboard Shortcuts Overlay Component
 *
 * A modal dialog displaying all available keyboard shortcuts.
 * Opens via its own global `?` keydown listener or via `isOpen` being set
 * true by a parent (e.g. the command palette).
 *
 * @returns {JSX.Element | null} The overlay modal, or null if closed.
 */
export default function KeyboardShortcutsOverlay({
  isOpen,
  onOpen,
  onClose,
}: KeyboardShortcutsOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  const shortcutsByScope = useMemo(() => {
    const grouped = SHORTCUTS.reduce<Record<string, ShortcutDefinition[]>>((acc, shortcut) => {
      const existing = acc[shortcut.scope] ?? []
      acc[shortcut.scope] = [...existing, shortcut]
      return acc
    }, {})

    return ['Global', 'Search', 'Lesson'].flatMap((scope) =>
      grouped[scope] ? [[scope, grouped[scope]] as const] : [],
    )
  }, [])

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        if (isTypingInEditableElement(event.target)) {
          return
        }
        event.preventDefault()
        onOpen()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [onOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const priorFocus = document.activeElement as HTMLElement | null
    const closeButton =
      dialogRef.current?.querySelector<HTMLButtonElement>('[data-shortcuts-close]')
    closeButton?.focus()

    const handleOpenKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return
      }

      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      )
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleOpenKeyDown)
    return () => {
      window.removeEventListener('keydown', handleOpenKeyDown)
      priorFocus?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="shortcut-overlay-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={dialogRef}
        className="shortcut-overlay-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
      >
        <div className="shortcut-overlay-header">
          <h2 id="keyboard-shortcuts-title">Keyboard shortcuts</h2>
          <button
            type="button"
            className="shortcut-overlay-close"
            data-shortcuts-close
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
          >
            Esc
          </button>
        </div>

        {shortcutsByScope.map(([scope, shortcuts]) => (
          <section key={scope} className="shortcut-overlay-group" aria-label={scope}>
            <h3>{scope}</h3>
            <ul>
              {shortcuts.map((shortcut) => (
                <li key={`${scope}-${shortcut.keys}-${shortcut.description}`}>
                  <span className="shortcut-overlay-keys">
                    <kbd>{shortcut.keys}</kbd>
                  </span>
                  <span>{shortcut.description}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
