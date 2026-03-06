import { describe, it, expect } from 'vitest'
import { validatePythonCode } from '../codeSecurity'

describe('validatePythonCode - Unicode Normalization Bypass Attempts', () => {
  it('should block unicode identifier bypass for globals', () => {
    // 𝕘lobals() -> normalizes to globals()
    expect(validatePythonCode('\uD835\uDD58lobals()').valid).toBe(false)
  })

  it('should block unicode identifier bypass for eval', () => {
    // e𝕧al -> normalizes to eval
    expect(validatePythonCode('e\uD835\uDD67al("import js")').valid).toBe(false)
  })

  it('should block unicode identifier bypass for getattr', () => {
    // 𝔤etattr -> normalizes to getattr
    expect(validatePythonCode('\uD835\uDD24etattr(print, "__globals__")').valid).toBe(false)
  })

  it('should block unicode identifier bypass for __builtins__', () => {
    // __𝖇uiltins__ -> normalizes to __builtins__
    expect(validatePythonCode('__\uD835\uDD87uiltins__').valid).toBe(false)
  })
})

describe('validatePythonCode - Additional Frame Attributes', () => {
  it('should block f_locals', () => {
    expect(validatePythonCode('f.f_locals').valid).toBe(false)
  })

  it('should block gi_frame', () => {
    expect(validatePythonCode('g.gi_frame').valid).toBe(false)
  })

  it('should block cr_frame', () => {
    expect(validatePythonCode('c.cr_frame').valid).toBe(false)
  })

  it('should block ag_frame', () => {
    expect(validatePythonCode('a.ag_frame').valid).toBe(false)
  })
})
