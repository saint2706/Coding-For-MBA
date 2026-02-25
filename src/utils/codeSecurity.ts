/**
 * Code Security Utilities
 *
 * Provides validation and sanitization for user-submitted Python code.
 * Ensures that executed code cannot access sensitive browser APIs or system internals.
 *
 * Key Responsibilities:
 * - Validate Python code against a blocklist of dangerous modules and functions.
 * - Prevent direct access to the 'js' module and other Pyodide internals.
 * - Normalize code to prevent regex bypass attempts.
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Strips comments and string literals from Python code.
 * This allows for stricter security checks on the remaining code structure
 * without flagging keywords inside strings or comments.
 *
 * SECURITY MODEL:
 * 1. Safe Strings (e.g. "hello", 'world', b"bytes", u"unicode"):
 *    - These are replaced with empty strings ("") or prefix + "" (u"").
 *    - Content is removed because keywords inside a string literal (e.g. print("import os")) are harmless.
 *
 * 2. Unsafe Strings (f-strings, e.g. f"{exec()}", F"Dangerous"):
 *    - These are PRESERVED (content is kept).
 *    - This is because f-strings allow code execution within the curly braces {}.
 *    - By preserving them, the subsequent validation logic can scan the code inside the f-string.
 *
 * 3. Comments (# ...):
 *    - Removed entirely as they are not executable.
 *
 * @param code - The Python code to process
 * @returns The code with SAFE strings and comments removed
 */
export function stripPythonCommentsAndStrings(code: string): string {
  let stripped = code

  // Regex explanation:
  // ([a-zA-Z]*) captures the prefix (e.g. f, r, u, b, fr, etc.) immediately preceding the quote.
  // Then we match one of the quote types (triple double, triple single, double, single).
  // We use a callback to check the prefix.
  const stringRegex =
    /([a-zA-Z]*)(?:('''[\s\S]*?'''|"""[\s\S]*?""")|("(\\.|[^"\\])*")|('(\\.|[^'\\])*'))/g

  stripped = stripped.replace(stringRegex, (match, prefix) => {
    // If the prefix contains f or F, it's an f-string (or potential f-string like 'fr').
    // We MUST preserve it because it might contain code execution (e.g. f"{eval()}").
    if (prefix && /[fF]/.test(prefix)) {
      return match
    }
    // Otherwise, it's a safe string (raw, unicode, bytes, or normal).
    // We strip the content but keep the prefix to maintain syntax structure (e.g. u"..." -> u"").
    return (prefix || '') + '""'
  })

  // Remove comments (after string processing to avoid stripping # inside preserved f-strings)
  stripped = stripped.replace(/#.*/g, '')

  return stripped
}

/**
 * Validates Python code for potential security risks before execution.
 *
 * Checks for:
 * - Direct access to the 'js' module (browser API access)
 * - Usage of __import__ (prevents dynamic module loading)
 * - Import/Access of sys, os, subprocess, importlib (prevents system access)
 * - Access to dangerous built-in functions (eval, exec)
 * - Access to internal dunder methods (__subclasses__, etc.)
 *
 * Note: This validation runs on code STRIPPED of safe strings and comments.
 * f-strings are preserved to catch hidden execution.
 *
 * @param code - The Python code to validate
 * @returns Validation result
 */
export function validatePythonCode(code: string): ValidationResult {
  if (!code) return { valid: true }

  // Normalize code to handle line continuations
  const normalizedCode = code.replace(/\\(\r\n|\r|\n)/g, '')

  // Strip safe strings and comments to focus on logic
  const strippedCode = stripPythonCommentsAndStrings(normalizedCode)

  // 1. Property-Safe Deny Patterns (Keywords banned as references/assignments UNLESS properties)
  // e.g. eval() is banned, but model.eval() is allowed.
  // Note: __getattribute__ is in strict deny, so obj.__getattribute__ is also banned.
  const propertySafeKeywords = ['eval', 'exec']
  const propertySafeRegex = new RegExp(`(?<!\\.)\\b(${propertySafeKeywords.join('|')})\\b`)
  if (propertySafeRegex.test(strippedCode)) {
    return {
      valid: false,
      error: 'Security Error: Usage of dangerous built-in functions is restricted.',
    }
  }

  // 2. Strict Deny Patterns (Keywords banned GLOBALLY, even as properties)
  // e.g. func.__globals__ is dangerous. importlib is dangerous.
  const globalKeywords = [
    'globals',
    'locals',
    '__import__',
    'subprocess',
    'sys',
    'os',
    'importlib',
    'builtins',
    '__builtins__',
    '__globals__',
    '__subclasses__',
    '__bases__',
    '__mro__',
    '__getattribute__',
    '__code__',
    '__closure__',
    '__loader__',
    '__spec__',
  ]
  const globalRegex = new RegExp(`\\b(${globalKeywords.join('|')})\\b`)
  if (globalRegex.test(strippedCode)) {
    return {
      valid: false,
      error: 'Security Error: Usage of dangerous built-ins, modules, or internals is restricted.',
    }
  }

  // 3. Call Deny Patterns (Keywords banned ONLY when called)
  const callKeywords = [
    'getattr',
    'setattr',
    'delattr',
    'hasattr',
    'vars',
    'dir',
    'input',
    'breakpoint',
    'help',
    'exit',
    'quit',
    'open',
    'compile',
    'memoryview',
    'copyright',
    'credits',
    'license',
  ]
  const callRegex = new RegExp(`(?<!\\.)\\b(${callKeywords.join('|')})\\s*\\(`)
  if (callRegex.test(strippedCode)) {
    return {
      valid: false,
      error: 'Security Error: Usage of interactive or reflection functions is restricted.',
    }
  }

  // 4. Import Deny Patterns (Specific module imports)
  const importPatterns = [
    /\bimport\s+js\b/,
    /\bfrom\s+js\b/,
    /\bimport\s+pyodide\b/,
    /\bfrom\s+pyodide\b/,
    /\bimport\s+micropip\b/,
    /\bfrom\s+micropip\b/,
  ]

  for (const pattern of importPatterns) {
    if (pattern.test(strippedCode)) {
      return {
        valid: false,
        error:
          'Security Error: Direct access to internal modules (js, pyodide, micropip) is restricted.',
      }
    }
  }

  return { valid: true }
}
