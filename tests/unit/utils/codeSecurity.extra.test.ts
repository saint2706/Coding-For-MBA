import { describe, it, expect } from 'vitest'
import { validatePythonCode } from '../../../src/utils/codeSecurity'

describe('validatePythonCode Security Checks', () => {
  const unsafeCodes = [
    // Existing checks (should pass)
    "eval('print(1)')",
    "exec('print(1)')",
    "__import__('os').system('ls')",
    'import os',
    'from os import system',
    'import sys',
    'import subprocess',
    "open('/etc/passwd')",
    "input('give me data')",
    'breakpoint()',
    'help()',
    'exit()',
    'quit()',
    "f'{eval(1)}'",
    'f\'{__import__("os")}\'',
    "getattr(builtins, 'eval')('print(1)')",
    '[x for x in ().__class__.__base__.__subclasses__()]',

    // New checks (should fail initially)
    'copyright()',
    'credits()',
    'license()',
    '__loader__',
    '__spec__',
  ]

  const safeCodes = [
    "print('hello')",
    'x = 1 + 1',
    'def my_func(): return 1',
    'model.eval()',
    'my_obj.exec = 1',
    "df['eval']",
    "df.eval('x + 1')",
  ]

  unsafeCodes.forEach((code) => {
    it(`should block unsafe code: ${code}`, () => {
      const result = validatePythonCode(code)
      expect(result.valid, `Expected "${code}" to be invalid`).toBe(false)
    })
  })

  safeCodes.forEach((code) => {
    it(`should allow safe code: ${code}`, () => {
      const result = validatePythonCode(code)
      expect(result.valid, `Expected "${code}" to be valid`).toBe(true)
    })
  })
})
