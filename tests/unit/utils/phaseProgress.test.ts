import { describe, it, expect } from 'vitest'
import { isPhaseComplete } from '../../../src/utils/phaseProgress'

describe('isPhaseComplete', () => {
  it('returns true when every lesson in the phase is completed', () => {
    expect(isPhaseComplete(3, 3)).toBe(true)
  })

  it('returns false when some lessons remain incomplete', () => {
    expect(isPhaseComplete(2, 3)).toBe(false)
  })

  it('returns false for a phase with zero lessons', () => {
    expect(isPhaseComplete(0, 0)).toBe(false)
  })
})
