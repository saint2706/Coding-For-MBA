import { describe, it, expect } from 'vitest'
import { validatePythonCode } from '../codeSecurity'

describe('validatePythonCode - Security Bypass Reproduction', () => {
  it('should catch bypass via variable assignment', () => {
    const bypassCode = `
imp = __import__
sys = imp('sys')
`
    // Currently this passes (valid: true) because the regex expects '(' after __import__
    // We expect the FIX to make this false.
    const result = validatePythonCode(bypassCode)
    expect(result.valid).toBe(false)
  })

  it('should catch bypass via getattr assignment', () => {
    const bypassCode = `
g = getattr
# use g(obj, 'attr') to bypass strict getattr(...) regex
`
    const result = validatePythonCode(bypassCode)
    expect(result.valid).toBe(false)
  })

  it('should catch bypass via f-strings (if we implement f-string scanning)', () => {
     // Even if we don't scan f-strings, strict regex should catch the identifiers inside
     const bypassCode = `f"{__import__('os')}"`
     const result = validatePythonCode(bypassCode)
     expect(result.valid).toBe(false)
  })

  it('should catch simple import os via variable assignment bypass', () => {
      const bypassCode = `
i = __import__
os = i('os')
`
      const result = validatePythonCode(bypassCode)
      expect(result.valid).toBe(false)
  })
})
