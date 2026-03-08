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

export type ShortcutScope = 'Global' | 'Search' | 'Lesson' | 'Review'

export interface ShortcutDefinition {
  keys: string
  description: string
  scope: ShortcutScope
}

/**
 * Array of predefined keyboard shortcut definitions used across the application.
 * Defines the keys, descriptive action, and operational scope for each shortcut.
 */
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
  {
    keys: 'Space / Enter',
    description: 'Reveal answer',
    scope: 'Review',
  },
  {
    keys: '1',
    description: 'Rate "Again"',
    scope: 'Review',
  },
  {
    keys: '2',
    description: 'Rate "Hard"',
    scope: 'Review',
  },
  {
    keys: '3',
    description: 'Rate "Good"',
    scope: 'Review',
  },
  {
    keys: '4',
    description: 'Rate "Easy"',
    scope: 'Review',
  },
] as const satisfies readonly ShortcutDefinition[]

/**
 * Determines whether the given event target is an editable element (like an input or textarea),
 * to prevent global keyboard shortcuts from firing while the user is typing.
 *
 * @param {EventTarget | null} target - The DOM element to check.
 * @returns {boolean} True if the target is an editable element, false otherwise.
 */
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
