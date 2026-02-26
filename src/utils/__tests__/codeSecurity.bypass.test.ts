import { describe, it, expect } from 'vitest'
import { validatePythonCode } from '../codeSecurity'

describe('validatePythonCode - Bypass Attempts', () => {
  it('should block aliased input()', () => {
    // Current bypass: f = input; f()
    const code = 'f = input\nf("prompt")'
    expect(validatePythonCode(code).valid).toBe(false)
  })

  it('should block aliased open()', () => {
    const code = 'f = open\nf("file")'
    expect(validatePythonCode(code).valid).toBe(false)
  })

  it('should block aliased getattr()', () => {
    const code = 'g = getattr\ng(obj, "__subclasses__")'
    expect(validatePythonCode(code).valid).toBe(false)
  })

  it('should block aliased exit()', () => {
    const code = 'e = exit\ne()'
    expect(validatePythonCode(code).valid).toBe(false)
  })

  it('should allow benign use of keywords as properties', () => {
    // We want to ensure that banning 'open' as a keyword doesn't block 'obj.open()'
    // or 'obj.input', which are common in APIs (like Pandas or UI libs).
    expect(validatePythonCode('file.open()').valid).toBe(true)
    expect(validatePythonCode('widget.input.value').valid).toBe(true)
    expect(validatePythonCode('sys.exit').valid).toBe(false) // sys is globally banned anyway
    expect(validatePythonCode('obj.exit()').valid).toBe(true)
    expect(validatePythonCode('data.dir = "up"').valid).toBe(true)
  })

  it('should block dangerous functions even if seemingly safe properties', () => {
    // eval is property-safe blocked.
    // But we should ensure we don't accidentally allow 'input' if it's used as a variable name?
    // 'input = 1' -> 'input' is an identifier.
    // If we ban 'input' identifier, we ban shadowing builtins. This is GOOD for security/education.
    expect(validatePythonCode('input = 1').valid).toBe(false)
    expect(validatePythonCode('def input(): pass').valid).toBe(false)
  })
})
