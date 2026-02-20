/**
 * Keyboard Shortcuts Overlay
 *
 * A modal dialog displaying all available keyboard shortcuts.
 *
 * Key Responsibilities:
 * - List all shortcuts grouped by scope (Global, Search, Lesson).
 * - Handle opening/closing via keyboard (Shift+?) and mouse.
 * - Manage focus trap within the dialog.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { SHORTCUTS, isTypingInEditableElement, type ShortcutDefinition } from '../utils/shortcuts'

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function KeyboardShortcutsOverlay() {
  const [isOpen, setIsOpen] = useState(false)
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
        setIsOpen(true)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

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
        setIsOpen(false)
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
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="shortcut-overlay-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setIsOpen(false)
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
            onClick={() => setIsOpen(false)}
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
