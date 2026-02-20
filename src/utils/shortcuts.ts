export type ShortcutScope = 'Global' | 'Search' | 'Lesson'

export interface ShortcutDefinition {
  keys: string
  description: string
  scope: ShortcutScope
}

export const SHORTCUTS: ShortcutDefinition[] = [
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
]

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
