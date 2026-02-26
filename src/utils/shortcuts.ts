/**
 * Keyboard Shortcuts Configuration
 *
 * Defines the application's keyboard shortcut mappings and helper utilities
 * for detecting keyboard events.
 *
 * Key Responsibilities:
 * - Centralize shortcut definitions (keys, descriptions, scopes).
 * - Provide a utility to detect if a user is typing in an input field.
 */

export type ShortcutScope = 'Global' | 'Search' | 'Lesson'

export interface ShortcutDefinition {
  keys: string
  description: string
  scope: ShortcutScope
}

export const SHORTCUTS = [
  {
    keys: '?',
    description: 'Open keyboard shortcuts overlay',
    scope: 'Global',
  },
  {
    keys: '/',
    description: 'Focus search input in the navbar',
    scope: 'Search',
  },
  {
    keys: 'Esc',
    description: 'Close the search input (when focused)',
    scope: 'Search',
  },
  {
    keys: 'Esc',
    description: 'Close keyboard shortcuts overlay',
    scope: 'Global',
  },
  {
    keys: '←',
    description: 'Go to previous lesson',
    scope: 'Lesson',
  },
  {
    keys: '→',
    description: 'Go to next lesson',
    scope: 'Lesson',
  },
] as const satisfies readonly ShortcutDefinition[]

export const isTypingInEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable ||
    target.getAttribute('role') === 'textbox'
  )
}
