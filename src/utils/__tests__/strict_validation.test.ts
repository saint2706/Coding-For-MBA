import { describe, it, expect } from 'vitest'
import { validatePythonCode } from '../codeSecurity'

describe('validatePythonCode - Strict Validation', () => {
  it('should block eval', () => {
    expect(validatePythonCode('eval("1+1")').valid).toBe(false)
    expect(validatePythonCode('x = eval').valid).toBe(false)
  })

  it('should allow model.eval()', () => {
    expect(validatePythonCode('model.eval()').valid).toBe(true)
    expect(validatePythonCode('x.eval(1)').valid).toBe(true)
  })

  it('should block getattr', () => {
    expect(validatePythonCode('getattr(obj, "x")').valid).toBe(false)
    expect(validatePythonCode('g = getattr').valid).toBe(false)
  })

  it('should allow obj.getattr() if it exists as a method', () => {
     // Python objects don't usually have .getattr() but if they did:
     expect(validatePythonCode('obj.getattr("x")').valid).toBe(true)
  })

  it('should block __import__ always', () => {
    expect(validatePythonCode('__import__("os")').valid).toBe(false)
    // Even as method (because I didn't add lookbehind for __import__)
    expect(validatePythonCode('x.__import__("os")').valid).toBe(false)
  })

  it('should block os and sys identifiers', () => {
    expect(validatePythonCode('import os').valid).toBe(false)
    expect(validatePythonCode('import sys').valid).toBe(false)
    expect(validatePythonCode('x = os').valid).toBe(false)
    expect(validatePythonCode('x = sys').valid).toBe(false)
  })

  it('should block f-string bypass attempts via content scanning', () => {
      // Since we scan everything, "eval" inside string is blocked
      expect(validatePythonCode('f"{eval(x)}"').valid).toBe(false)
      // Even in normal strings!
      expect(validatePythonCode('print("eval")').valid).toBe(false)
  })

  it('should allow safe code', () => {
      expect(validatePythonCode('print("Hello")').valid).toBe(true)
      expect(validatePythonCode('x = 1 + 2').valid).toBe(true)
      expect(validatePythonCode('import json').valid).toBe(true)
      expect(validatePythonCode('import math').valid).toBe(true)
  })
})
