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

  it('should block importlib.import_module("js")', () => {
    expect(validatePythonCode('importlib.import_module("js")').valid).toBe(false)
    expect(validatePythonCode("importlib.import_module('js')").valid).toBe(false)
    expect(
      validatePythonCode('from importlib import import_module; import_module("js")').valid,
    ).toBe(false)
  })

  it('should allow importlib for legitimate uses', () => {
    expect(validatePythonCode('import importlib').valid).toBe(true)
    expect(validatePythonCode('import importlib.metadata').valid).toBe(true)
    expect(validatePythonCode('import importlib.resources').valid).toBe(true)
    // Note: importlib.import_module() is intentionally blocked to prevent dynamic
    // module loading, which could be used to bypass security restrictions.
    // This is acceptable for an educational platform where dynamic imports aren't needed.
  })

  it('should block string concatenation in __import__', () => {
    expect(validatePythonCode('__import__("j" + "s")').valid).toBe(false)
    expect(validatePythonCode("__import__('j' + 's')").valid).toBe(false)
    expect(validatePythonCode('__import__(chr(106)+chr(115))').valid).toBe(false)
  })

  it('should block __builtins__.__import__', () => {
    expect(validatePythonCode('__builtins__.__import__("js")').valid).toBe(false)
    expect(validatePythonCode("__builtins__.__import__('js')").valid).toBe(false)
  })

  it('should allow imports with comments', () => {
    expect(validatePythonCode('import json  # load data').valid).toBe(true)
    expect(validatePythonCode('import math  # calculations').valid).toBe(true)
  })

  it('should block js imports with comments', () => {
    expect(validatePythonCode('import js  # some comment').valid).toBe(false)
    expect(validatePythonCode('from js import window  # access browser').valid).toBe(false)
  })

  it('should allow legitimate math operations', () => {
    // Ensure we don't break legitimate code with + operators
    expect(validatePythonCode('x = 1 + 2').valid).toBe(true)
    expect(validatePythonCode('result = "hello" + "world"').valid).toBe(true)
  })

  it('should block various obfuscation attempts', () => {
    // Block various ways to construct 'js' dynamically
    expect(validatePythonCode('__import__("js".lower())').valid).toBe(false)
    expect(validatePythonCode('x = __import__("j" + "s")').valid).toBe(false)
  })

  it('should block eval and exec', () => {
    expect(validatePythonCode('eval("print(1)")').valid).toBe(false)
    expect(validatePythonCode('exec("print(1)")').valid).toBe(false)
    expect(validatePythonCode('x = eval("1+1")').valid).toBe(false)
  })

  it('should block globals, locals, getattr', () => {
    expect(validatePythonCode('globals()').valid).toBe(false)
    expect(validatePythonCode('locals()').valid).toBe(false)
    expect(validatePythonCode('getattr(obj, "name")').valid).toBe(false)
  })

  it('should allow method calls named eval, exec, etc', () => {
    expect(validatePythonCode('model.eval()').valid).toBe(true)
    expect(validatePythonCode('obj.exec()').valid).toBe(true)
    expect(validatePythonCode('obj.globals()').valid).toBe(true)
  })

  it('should block __builtins__ access', () => {
    expect(validatePythonCode('__builtins__').valid).toBe(false)
    expect(validatePythonCode('print(__builtins__)').valid).toBe(false)
    expect(validatePythonCode('x = __builtins__').valid).toBe(false)
  })
})
