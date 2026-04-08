import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  SearchEmptyIllustration,
  ExercisesEmptyIllustration,
  FreshStartIllustration,
} from '../EmptyStateIllustrations'
import * as motion from 'motion/react'

vi.mock('motion/react', () => ({
  useReducedMotion: vi.fn(),
}))

describe('EmptyStateIllustrations', () => {
  describe('SearchEmptyIllustration', () => {
    it('renders with reduced motion disabled by default', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(false)
      const { container } = render(<SearchEmptyIllustration className="test-class" />)
      expect(container.querySelector('svg')).toBeDefined()
      expect(container.querySelector('.test-class')).toBeDefined()
      expect(container.querySelector('.empty-state-line')).toBeDefined()
    })

    it('renders with reduced motion enabled', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(true)
      const { container } = render(<SearchEmptyIllustration />)
      expect(container.querySelector('svg')).toBeDefined()
      expect(container.querySelector('.empty-state-line')).toBeNull()
    })
  })

  describe('ExercisesEmptyIllustration', () => {
    it('renders with reduced motion disabled by default', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(false)
      const { container } = render(<ExercisesEmptyIllustration className="test-class" />)
      expect(container.querySelector('svg')).toBeDefined()
      expect(container.querySelector('.test-class')).toBeDefined()
      expect(container.querySelector('.empty-state-dot')).toBeDefined()
    })

    it('renders with reduced motion enabled', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(true)
      const { container } = render(<ExercisesEmptyIllustration />)
      expect(container.querySelector('svg')).toBeDefined()
      expect(container.querySelector('.empty-state-dot')).toBeNull()
    })
  })

  describe('FreshStartIllustration', () => {
    it('renders with reduced motion disabled by default', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(false)
      const { container } = render(<FreshStartIllustration className="test-class" />)
      expect(container.querySelector('svg')).toBeDefined()
      expect(container.querySelector('.test-class')).toBeDefined()
      expect(container.querySelector('.empty-state-dot')).toBeDefined()
      expect(container.querySelector('.empty-state-line')).toBeDefined()
    })

    it('renders with reduced motion enabled', () => {
      vi.mocked(motion.useReducedMotion).mockReturnValue(true)
      const { container } = render(<FreshStartIllustration />)
      expect(container.querySelector('svg')).toBeDefined()
      expect(container.querySelector('.empty-state-dot')).toBeNull()
      expect(container.querySelector('.empty-state-line')).toBeNull()
    })
  })
})
