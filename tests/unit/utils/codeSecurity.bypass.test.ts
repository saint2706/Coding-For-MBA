import { describe, it, expect } from 'vitest'
import { validatePythonCode } from '../../../src/utils/codeSecurity'

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

  it('should block import math, js', () => {
    expect(validatePythonCode('import math, js').valid).toBe(false)
  })

  it('should block from builtins import *', () => {
    expect(validatePythonCode('from builtins import *').valid).toBe(false)
  })

  it('should block import math, builtins', () => {
    expect(validatePythonCode('import math, builtins').valid).toBe(false)
  })

  it('should block from js import eval', () => {
    expect(validatePythonCode('from js import eval').valid).toBe(false)
  })

  it('should block import js.something', () => {
    expect(validatePythonCode('import js.something').valid).toBe(false)
  })

  it('should block import js, math', () => {
    expect(validatePythonCode('import js, math').valid).toBe(false)
  })

  it('should allow benign word that contains js', () => {
    expect(validatePythonCode('import json').valid).toBe(true)
    expect(validatePythonCode('from json import dumps').valid).toBe(true)
  })

  it('should allow variable named js if not imported', () => {
    expect(validatePythonCode('js = 5').valid).toBe(true)
  })

  it('should not block from js import if js is a variable', () => {
    expect(validatePythonCode('from some_module import json').valid).toBe(true)
  })

  it('should block sandbox escape via dunder dict reflection', () => {
    expect(validatePythonCode('().__class__.__base__.__dict__["__subclasses__"]()').valid).toBe(
      false,
    )
    expect(validatePythonCode('c = __class__').valid).toBe(false)
    expect(validatePythonCode('b = __base__').valid).toBe(false)
    expect(validatePythonCode('d = __dict__').valid).toBe(false)
  })

  it('should block sandbox escape via frame and traceback attributes', () => {
    const tracebackEscape = `
try:
    1/0
except Exception as e:
    tb = e.__traceback__
    f = tb.tb_frame
    g = f.f_globals
    b = g["__builtins__"]
    b["__import__"]("os").system("echo exploited")
`
    expect(validatePythonCode(tracebackEscape).valid).toBe(false)
    expect(validatePythonCode('x = f_back').valid).toBe(false)
    expect(validatePythonCode('y = f_builtins').valid).toBe(false)
    expect(validatePythonCode('z = f_code').valid).toBe(false)
  })
})
