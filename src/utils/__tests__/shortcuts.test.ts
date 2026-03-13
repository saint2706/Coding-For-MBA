import { describe, it, expect } from 'vitest'
import { SHORTCUTS, isTypingInEditableElement } from '../shortcuts'

describe('shortcuts utils', () => {
  describe('SHORTCUTS', () => {
    it('should define a list of shortcuts', () => {
      expect(Array.isArray(SHORTCUTS)).toBe(true)
      expect(SHORTCUTS.length).toBeGreaterThan(0)

      SHORTCUTS.forEach((shortcut) => {
        expect(shortcut).toHaveProperty('keys')
        expect(shortcut).toHaveProperty('description')
        expect(shortcut).toHaveProperty('scope')
      })
    })
  })

  describe('isTypingInEditableElement', () => {
    it('returns false if target is null', () => {
      expect(isTypingInEditableElement(null)).toBe(false)
    })

    it('returns false if target is not an HTMLElement', () => {
      // e.g., text node or document
      expect(isTypingInEditableElement({} as EventTarget)).toBe(false)
    })

    it('returns true for INPUT element', () => {
      const input = document.createElement('input')
      expect(isTypingInEditableElement(input)).toBe(true)
    })

    it('returns true for TEXTAREA element', () => {
      const textarea = document.createElement('textarea')
      expect(isTypingInEditableElement(textarea)).toBe(true)
    })

    it('returns true for element with isContentEditable true', () => {
      const div = document.createElement('div')
      // Simulate isContentEditable for testing environment if needed
      Object.defineProperty(div, 'isContentEditable', { value: true })
      expect(isTypingInEditableElement(div)).toBe(true)
    })

    it('returns false for element with isContentEditable false', () => {
      const div = document.createElement('div')
      Object.defineProperty(div, 'isContentEditable', { value: false })
      expect(isTypingInEditableElement(div)).toBe(false)
    })

    it('returns true for element with role="textbox"', () => {
      const div = document.createElement('div')
      div.setAttribute('role', 'textbox')
      expect(isTypingInEditableElement(div)).toBe(true)
    })

    it('returns false for non-editable elements', () => {
      const div = document.createElement('div')
      const span = document.createElement('span')
      const button = document.createElement('button')

      expect(isTypingInEditableElement(div)).toBe(false)
      expect(isTypingInEditableElement(span)).toBe(false)
      expect(isTypingInEditableElement(button)).toBe(false)
    })
  })
})
