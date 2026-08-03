import { describe, it, expect } from 'vitest'
import { validatePythonCode, stripPythonCommentsAndStrings } from '../codeSecurity'

describe('stripPythonCommentsAndStrings', () => {
  it('should strip simple strings', () => {
    const code = 'print("hello")\nprint(\'world\')'
    expect(stripPythonCommentsAndStrings(code)).toBe('print("")\nprint("")')
  })

  it('should strip triple quoted strings', () => {
    const code = 'print("""hello\nworld""")'
    expect(stripPythonCommentsAndStrings(code)).toBe('print("")')
  })

  it('should strip comments', () => {
    const code = 'print(1) # this is a comment'
    expect(stripPythonCommentsAndStrings(code).trim()).toBe('print(1)')
  })

  it('should handle strings with comments inside', () => {
    const code = 'print("# not a comment")'
    expect(stripPythonCommentsAndStrings(code)).toBe('print("")')
  })

  it('should handle escaped quotes', () => {
    const code = 'print("say \\"hello\\"")'
    expect(stripPythonCommentsAndStrings(code)).toBe('print("")')
  })

  it('should preserve f-strings', () => {
    const code = 'print(f"hello {name}")'
    expect(stripPythonCommentsAndStrings(code)).toBe('print(f"hello {name}")')
  })

  it('should preserve F-strings', () => {
    const code = 'print(F"hello {name}")'
    expect(stripPythonCommentsAndStrings(code)).toBe('print(F"hello {name}")')
  })

  it('should strip r-strings', () => {
    const code = 'print(r"raw")'
    expect(stripPythonCommentsAndStrings(code)).toBe('print(r"")')
  })
})

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

  it('should allow print("import js") because it is in a string', () => {
    expect(validatePythonCode('print("import js")').valid).toBe(true)
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
    // blocked by __import__ global ban
    expect(validatePythonCode('__import__("j" + "s")').valid).toBe(false)
    expect(validatePythonCode("__import__('j' + 's')").valid).toBe(false)
    expect(validatePythonCode('__import__(chr(106)+chr(115))').valid).toBe(false)
  })

  it('should block __builtins__.__import__', () => {
    expect(validatePythonCode('__builtins__.__import__("js")').valid).toBe(false)
    expect(validatePythonCode("__builtins__.__import__('js')").valid).toBe(false)
  })

  it('should allow legitimate math operations', () => {
    expect(validatePythonCode('x = 1 + 2').valid).toBe(true)
    expect(validatePythonCode('result = "hello" + "world"').valid).toBe(true)
  })

  it('should block eval and exec', () => {
    expect(validatePythonCode('eval("print(1)")').valid).toBe(false)
    expect(validatePythonCode('exec("print(1)")').valid).toBe(false)
    expect(validatePythonCode('x = eval("1+1")').valid).toBe(false)
    expect(validatePythonCode('eval("im" + "port js")').valid).toBe(false)
    expect(validatePythonCode('exec("im" + "port js")').valid).toBe(false)
  })

  it('should block eval/exec assignment (Bypass Fix)', () => {
    expect(validatePythonCode('e = exec').valid).toBe(false)
    expect(validatePythonCode('my_eval = eval').valid).toBe(false)
    expect(validatePythonCode('func(exec)').valid).toBe(false)
    expect(validatePythonCode('return eval').valid).toBe(false)
  })

  it('should allow "exec" inside strings (Usability Fix)', () => {
    expect(validatePythonCode('print("exec is dangerous")').valid).toBe(true)
    expect(validatePythonCode('print("eval()")').valid).toBe(true)
  })

  it('should preserve f-strings and detect dangerous code inside', () => {
    expect(validatePythonCode('f"{exec()}"').valid).toBe(false)
    expect(validatePythonCode('print(f"result: {eval(1)}")').valid).toBe(false)
    expect(validatePythonCode('f"{__import__(\'os\')}"').valid).toBe(false)
  })

  it('should allow safe f-strings', () => {
    expect(validatePythonCode('f"value: {x}"').valid).toBe(true)
    expect(validatePythonCode('print(f"hello {name}")').valid).toBe(true)
  })

  it('should allow "executing" or "evaluating" inside f-string (Word Boundary Safety)', () => {
    // \bexec\b ensures we don't flag words starting with exec
    expect(validatePythonCode('f"executing task"').valid).toBe(true)
    expect(validatePythonCode('f"evaluating model"').valid).toBe(true)
  })

  it('should flag standalone "exec" inside f-string', () => {
    expect(validatePythonCode('f"exec task"').valid).toBe(false)
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
    // globals, locals are now strict globally
    expect(validatePythonCode('obj.globals()').valid).toBe(false)
    expect(validatePythonCode('obj.locals()').valid).toBe(false)
    // getattr is call-safe (blocked only if called)
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

  it('should block introspection calls', () => {
    expect(validatePythonCode('setattr(obj, "name", "value")').valid).toBe(false)
    expect(validatePythonCode('delattr(obj, "name")').valid).toBe(false)
    expect(validatePythonCode('hasattr(obj, "name")').valid).toBe(false)
    expect(validatePythonCode('vars(obj)').valid).toBe(false)
    expect(validatePythonCode('dir(obj)').valid).toBe(false)
  })

  it('should block compile and open (Security Fix)', () => {
    expect(validatePythonCode('compile("code", "filename", "exec")').valid).toBe(false)
    expect(validatePythonCode('open("file.txt")').valid).toBe(false)
  })

  it('should block memoryview (Security Fix)', () => {
    expect(validatePythonCode('memoryview(b"123")').valid).toBe(false)
    expect(validatePythonCode('m = memoryview(data)').valid).toBe(false)
  })

  it('should allow method calls for introspection functions', () => {
    expect(validatePythonCode('obj.setattr("name")').valid).toBe(true)
    expect(validatePythonCode('obj.delattr("name")').valid).toBe(true)
    expect(validatePythonCode('obj.hasattr("name")').valid).toBe(true)
    expect(validatePythonCode('obj.vars()').valid).toBe(true)
    expect(validatePythonCode('obj.dir()').valid).toBe(true)
    expect(validatePythonCode('obj.compile()').valid).toBe(true)
    expect(validatePythonCode('obj.open()').valid).toBe(true)
  })

  it('should block introspection and escape vectors', () => {
    expect(validatePythonCode('f.__globals__').valid).toBe(false)
    expect(validatePythonCode('cls.__subclasses__()').valid).toBe(false)
    expect(validatePythonCode('cls.__bases__').valid).toBe(false)
    expect(validatePythonCode('cls.__mro__').valid).toBe(false)
    expect(validatePythonCode('obj.__getattribute__("x")').valid).toBe(false)
    expect(validatePythonCode('f.__code__').valid).toBe(false)
    expect(validatePythonCode('f.__closure__').valid).toBe(false)
  })

  it('should block obfuscated introspection access', () => {
    // getattr is call-blocked.
    expect(validatePythonCode('getattr(f, "__globals__")').valid).toBe(false)
  })

  it('should block line continuations bypassing checks', () => {
    expect(validatePythonCode('import \\\njs').valid).toBe(false)
    expect(validatePythonCode('from \\\njs import window').valid).toBe(false)
    expect(validatePythonCode('import \\\n  js').valid).toBe(false)
  })

  describe('Interactive functions (DoS protection)', () => {
    it('should detect input() usage', () => {
      expect(validatePythonCode('input("Enter something:")').valid).toBe(false)
    })

    it('should detect breakpoint() usage', () => {
      expect(validatePythonCode('breakpoint()').valid).toBe(false)
    })

    it('should detect help() usage', () => {
      expect(validatePythonCode('help(print)').valid).toBe(false)
    })

    it('should detect exit() usage', () => {
      expect(validatePythonCode('exit()').valid).toBe(false)
    })

    it('should detect quit() usage', () => {
      expect(validatePythonCode('quit()').valid).toBe(false)
    })
  })

  describe('Pyodide Internals', () => {
    it('should block import pyodide', () => {
      expect(validatePythonCode('import pyodide').valid).toBe(false)
      expect(validatePythonCode('import   pyodide').valid).toBe(false)
      expect(validatePythonCode('import pyodide as p').valid).toBe(false)
    })

    it('should block from pyodide import', () => {
      expect(validatePythonCode('from pyodide import code').valid).toBe(false)
      expect(validatePythonCode('from pyodide.code import run_js').valid).toBe(false)
    })

    it('should block import micropip', () => {
      expect(validatePythonCode('import micropip').valid).toBe(false)
      expect(validatePythonCode('from micropip import install').valid).toBe(false)
    })

    it('should block submodules', () => {
      expect(validatePythonCode('import pyodide.code').valid).toBe(false)
      expect(validatePythonCode('import micropip.transactions').valid).toBe(false)
    })
  })

  it('should block __getattribute__ on objects', () => {
    expect(validatePythonCode('obj.__getattribute__("name")').valid).toBe(false)
  })

  it('should handle complex f-strings', () => {
    expect(validatePythonCode('f"{1+1}"').valid).toBe(true)
    expect(validatePythonCode('f"{eval(1)} "').valid).toBe(false)
  })
  it('should not be bypassed with carriage return inside comment', () => {
    expect(validatePythonCode('import sys\n# this is a comment \rimport os').valid).toBe(false)
  })
})
