import { describe, it, expect } from 'vitest'
import { validatePythonCode } from './codeSecurity'

describe('validatePythonCode', () => {
  it('should allow safe code', () => {
    expect(validatePythonCode('print("Hello")').valid).toBe(true)
    expect(validatePythonCode('import json').valid).toBe(true)
    expect(validatePythonCode('import numpy as np').valid).toBe(true)
    expect(validatePythonCode('from math import sqrt').valid).toBe(true)
    expect(validatePythonCode('x = "js"').valid).toBe(true) // "js" string
  })

  it('should block import js', () => {
    expect(validatePythonCode('import js').valid).toBe(false)
    expect(validatePythonCode('  import js').valid).toBe(false)
    expect(validatePythonCode('import js as browser').valid).toBe(false)
  })

  it('should block from js import', () => {
    expect(validatePythonCode('from js import window').valid).toBe(false)
    expect(validatePythonCode('  from   js   import window').valid).toBe(false)
  })

  it('should block __import__("js")', () => {
    expect(validatePythonCode("__import__('js')").valid).toBe(false)
    expect(validatePythonCode('__import__("js")').valid).toBe(false)
    expect(validatePythonCode("foo = __import__('js')").valid).toBe(false)
  })

  it('should not block json imports', () => {
    expect(validatePythonCode('import json').valid).toBe(true)
    expect(validatePythonCode('from json import load').valid).toBe(true)
  })

  it('should block multiline imports', () => {
    const code = `
import os
import js
print("bad")
`
    expect(validatePythonCode(code).valid).toBe(false)
  })
})
