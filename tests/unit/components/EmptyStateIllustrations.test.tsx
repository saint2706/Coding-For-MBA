import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  SearchEmptyIllustration,
  ExercisesEmptyIllustration,
  FreshStartIllustration,
} from '../../../src/components/EmptyStateIllustrations'
import * as motion from 'motion/react'

vi.mock('motion/react', () => ({
  useReducedMotion: vi.fn(),
}))

describe('EmptyStateIllustrations', () => {
  describe('SearchEmptyIllustration', () => {
    it('renders a terminal prompt with a blinking cursor by default', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(false)
      const { container, getByText } = render(<SearchEmptyIllustration className="test-class" />)
      expect(container.querySelector('.empty-state-illustration')).not.toBeNull()
      expect(container.querySelector('.test-class')).not.toBeNull()
      expect(getByText('no results found')).toBeDefined()
      const cursor = container.querySelector('.empty-state-cursor')
      expect(cursor).not.toBeNull()
      expect(cursor?.classList.contains('empty-state-cursor--static')).toBe(false)
    })

    it('echoes the query text in the prompt line', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(false)
      const { getByText } = render(<SearchEmptyIllustration query="cash flow" />)
      expect(getByText('no results for "cash flow"')).toBeDefined()
    })

    it('shows an "awaiting input" prompt, never "no results", before a search has run', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(false)
      const { container, getByText } = render(<SearchEmptyIllustration variant="awaiting-input" />)
      expect(getByText('enter a search term')).toBeDefined()
      expect(container.textContent).not.toMatch(/no results/i)
    })

    it('collapses the cursor to static under reduced motion', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(true)
      const { container } = render(<SearchEmptyIllustration />)
      const cursor = container.querySelector('.empty-state-cursor')
      expect(cursor).not.toBeNull()
      expect(cursor?.classList.contains('empty-state-cursor--static')).toBe(true)
    })

    it('is decorative and does not duplicate the caller-provided accessible text', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(false)
      const { container } = render(<SearchEmptyIllustration />)
      expect(
        container.querySelector('.empty-state-illustration')?.getAttribute('aria-hidden'),
      ).toBe('true')
    })

    it('uses no hardcoded off-brand colors', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(false)
      const { container } = render(<SearchEmptyIllustration />)
      expect(container.innerHTML).not.toMatch(/rgba\(99,102,241|rgba\(167,139,250/)
    })
  })

  describe('ExercisesEmptyIllustration', () => {
    it('renders a terminal prompt describing the filtered-out state', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(false)
      const { container, getByText } = render(<ExercisesEmptyIllustration className="test-class" />)
      expect(container.querySelector('.empty-state-illustration')).not.toBeNull()
      expect(container.querySelector('.test-class')).not.toBeNull()
      expect(getByText('no exercises match these filters')).toBeDefined()
      expect(container.querySelector('.empty-state-cursor')).not.toBeNull()
    })

    it('collapses the cursor to static under reduced motion', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(true)
      const { container } = render(<ExercisesEmptyIllustration />)
      expect(
        container
          .querySelector('.empty-state-cursor')
          ?.classList.contains('empty-state-cursor--static'),
      ).toBe(true)
    })
  })

  describe('FreshStartIllustration', () => {
    it('renders a distinct boot-style prompt', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(false)
      const { container, getByText } = render(<FreshStartIllustration className="test-class" />)
      expect(container.querySelector('.empty-state-illustration')).not.toBeNull()
      expect(container.querySelector('.empty-state-illustration--boot')).not.toBeNull()
      expect(container.querySelector('.test-class')).not.toBeNull()
      expect(getByText('ready to start')).toBeDefined()
      expect(container.querySelector('.empty-state-cursor')).not.toBeNull()
    })

    it('collapses the cursor to static under reduced motion', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(true)
      const { container } = render(<FreshStartIllustration />)
      expect(
        container
          .querySelector('.empty-state-cursor')
          ?.classList.contains('empty-state-cursor--static'),
      ).toBe(true)
    })
  })
})
