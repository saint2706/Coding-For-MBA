import { describe, it, expect } from 'vitest'
import { validatePythonCode, stripPythonCommentsAndStrings } from '../codeSecurity'

describe('Security code validation - Newline bypass', () => {
  it('should not allow hiding malicious code behind a CR (\\r) comment', () => {
    // A comment ends at \r or \n. The following is effectively:
    // print('hello')
    // eval('1')
    // if stripped incorrectly, eval is ignored.
    const code = "print('hello') # comment\reval('1')"
    const stripped = stripPythonCommentsAndStrings(code)
    expect(stripped).toContain('eval')
    const result = validatePythonCode(code)
    expect(result.valid).toBe(false)
  })
})
