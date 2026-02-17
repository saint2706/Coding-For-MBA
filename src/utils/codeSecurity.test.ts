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

  it('should block importlib and dynamic module loading', () => {
    expect(validatePythonCode('importlib.import_module("js")').valid).toBe(false)
    expect(validatePythonCode("importlib.import_module('js')").valid).toBe(false)
    expect(
      validatePythonCode('from importlib import import_module; import_module("js")').valid,
    ).toBe(false)
    // New checks
    expect(validatePythonCode('import importlib').valid).toBe(false)
    expect(validatePythonCode('import importlib.metadata').valid).toBe(false)
    expect(validatePythonCode('from importlib import resources').valid).toBe(false)
    expect(validatePythonCode('import importlib as i').valid).toBe(false)
    expect(validatePythonCode('__import__("importlib")').valid).toBe(false)
  })

  it('should block sys.modules and other system access', () => {
    expect(validatePythonCode('sys.modules["js"]').valid).toBe(false)
    expect(validatePythonCode('sys.modules.get("js")').valid).toBe(false)
    expect(validatePythonCode('import sys').valid).toBe(false)
    expect(validatePythonCode('from sys import modules').valid).toBe(false)
    expect(validatePythonCode('__import__("sys")').valid).toBe(false)
    expect(validatePythonCode("__import__('sys')").valid).toBe(false)
    expect(validatePythonCode('os.system("ls")').valid).toBe(false)
    expect(validatePythonCode('os.popen("ls")').valid).toBe(false)
    expect(validatePythonCode('import os').valid).toBe(false)
    expect(validatePythonCode('from os import system').valid).toBe(false)
    expect(validatePythonCode('__import__("os")').valid).toBe(false)
    expect(validatePythonCode("__import__('os')").valid).toBe(false)
    expect(validatePythonCode('import subprocess').valid).toBe(false)
    expect(validatePythonCode('from subprocess import run').valid).toBe(false)
    expect(validatePythonCode('__import__("subprocess")').valid).toBe(false)
    expect(validatePythonCode("__import__('subprocess')").valid).toBe(false)
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
    expect(validatePythonCode('eval("im" + "port js")').valid).toBe(false)
    expect(validatePythonCode('exec("im" + "port js")').valid).toBe(false)
  })

  it('should block globals, locals, getattr', () => {
    expect(validatePythonCode('globals()').valid).toBe(false)
    expect(validatePythonCode('locals()').valid).toBe(false)
    expect(validatePythonCode('getattr(obj, "name")').valid).toBe(false)
    expect(validatePythonCode('getattr(__builtins__, "eval")("import js")').valid).toBe(false)
  })

  it('should allow method calls named eval, exec, etc', () => {
    expect(validatePythonCode('model.eval()').valid).toBe(true)
    expect(validatePythonCode('obj.exec()').valid).toBe(true)
    expect(validatePythonCode('obj.globals()').valid).toBe(true)
    expect(validatePythonCode('obj.locals()').valid).toBe(true)
    expect(validatePythonCode('obj.getattr("name")').valid).toBe(true)
  })

  it('should block __builtins__ access', () => {
    expect(validatePythonCode('__builtins__').valid).toBe(false)
    expect(validatePythonCode('print(__builtins__)').valid).toBe(false)
    expect(validatePythonCode('x = __builtins__').valid).toBe(false)
  })

  it('should block import builtins to prevent bypass', () => {
    expect(validatePythonCode('import builtins').valid).toBe(false)
    expect(validatePythonCode('from builtins import eval').valid).toBe(false)
    expect(validatePythonCode('from builtins import *').valid).toBe(false)
  })

  it('should block additional dangerous functions', () => {
    expect(validatePythonCode('setattr(obj, "name", "value")').valid).toBe(false)
    expect(validatePythonCode('delattr(obj, "name")').valid).toBe(false)
    expect(validatePythonCode('hasattr(obj, "name")').valid).toBe(false)
    expect(validatePythonCode('vars(obj)').valid).toBe(false)
    expect(validatePythonCode('dir(obj)').valid).toBe(false)
    expect(validatePythonCode('compile("code", "filename", "exec")').valid).toBe(false)
    expect(validatePythonCode('open("file.txt")').valid).toBe(false)
  })

  it('should allow method calls for new dangerous functions', () => {
    expect(validatePythonCode('obj.setattr("name")').valid).toBe(true)
    expect(validatePythonCode('obj.delattr("name")').valid).toBe(true)
    expect(validatePythonCode('obj.hasattr("name")').valid).toBe(true)
    expect(validatePythonCode('obj.vars()').valid).toBe(true)
    expect(validatePythonCode('obj.dir()').valid).toBe(true)
    expect(validatePythonCode('obj.compile()').valid).toBe(true)
    expect(validatePythonCode('obj.open()').valid).toBe(true)
  })
})
