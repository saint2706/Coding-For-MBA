import { render } from '@testing-library/react'
import { vi, describe, it, expect, afterEach } from 'vitest'
import {
  SearchEmptyIllustration,
  ExercisesEmptyIllustration,
  FreshStartIllustration,
} from '../EmptyStateIllustrations'

const mockUseReducedMotion = vi.fn()
vi.mock('motion/react', () => ({
  useReducedMotion: () => mockUseReducedMotion()
}))

describe('EmptyStateIllustrations', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('SearchEmptyIllustration', () => {
    it('renders with correct className', () => {
      mockUseReducedMotion.mockReturnValue(false)
      const { container } = render(<SearchEmptyIllustration className="test-class" />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg?.classList.contains('test-class')).toBe(true)
      expect(svg?.classList.contains('empty-state-illustration')).toBe(true)

      const line = container.querySelector('.empty-state-line')
      expect(line).not.toBeNull()
    })

    it('renders default class if not provided', () => {
      mockUseReducedMotion.mockReturnValue(false)
      const { container } = render(<SearchEmptyIllustration />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg?.classList.contains('empty-state-illustration')).toBe(true)
    })

    it('respects reduced motion', () => {
      mockUseReducedMotion.mockReturnValue(true)
      const { container } = render(<SearchEmptyIllustration />)
      const line = container.querySelector('.empty-state-line')
      expect(line).toBeNull()
    })
  })

  describe('ExercisesEmptyIllustration', () => {
    it('renders with correct className', () => {
      mockUseReducedMotion.mockReturnValue(false)
      const { container } = render(<ExercisesEmptyIllustration className="test-class" />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg?.classList.contains('test-class')).toBe(true)
      expect(svg?.classList.contains('empty-state-illustration')).toBe(true)

      const dot = container.querySelector('.empty-state-dot')
      expect(dot).not.toBeNull()
    })

    it('renders default class if not provided', () => {
      mockUseReducedMotion.mockReturnValue(false)
      const { container } = render(<ExercisesEmptyIllustration />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg?.classList.contains('empty-state-illustration')).toBe(true)
    })

    it('respects reduced motion', () => {
      mockUseReducedMotion.mockReturnValue(true)
      const { container } = render(<ExercisesEmptyIllustration />)
      const dot = container.querySelector('.empty-state-dot')
      expect(dot).toBeNull()
    })
  })

  describe('FreshStartIllustration', () => {
    it('renders with correct className', () => {
      mockUseReducedMotion.mockReturnValue(false)
      const { container } = render(<FreshStartIllustration className="test-class" />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg?.classList.contains('test-class')).toBe(true)
      expect(svg?.classList.contains('empty-state-illustration')).toBe(true)

      const dot = container.querySelector('.empty-state-dot')
      expect(dot).not.toBeNull()
    })

    it('renders default class if not provided', () => {
      mockUseReducedMotion.mockReturnValue(false)
      const { container } = render(<FreshStartIllustration />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg?.classList.contains('empty-state-illustration')).toBe(true)
    })

    it('respects reduced motion', () => {
      mockUseReducedMotion.mockReturnValue(true)
      const { container } = render(<FreshStartIllustration />)
      const dot = container.querySelector('.empty-state-dot')
      expect(dot).toBeNull()
      const line = container.querySelector('.empty-state-line')
      expect(line).toBeNull()
    })
  })
})
