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

/**
 * Result of the code security validation check.
 * @interface ValidationResult
 * @property {boolean} valid - Whether the code is safe to execute
 * @property {string} [error] - The error message if the validation failed
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
 * @param {string} code - The Python code to process
 * @returns {string} The code with SAFE strings and comments removed
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

  // Remove comments carefully, avoiding those inside preserved f-strings.
  // We parse the string to know if we are inside quotes before stripping a comment.
  let result = ''
  let inString = false
  let stringQuote = ''
  let escape = false
  let i = 0

  while (i < stripped.length) {
    const char = stripped[i]

    if (escape) {
      escape = false
      result += char
      i++
      continue
    }

    if (char === '\\') {
      escape = true
      result += char
      i++
      continue
    }

    // Check for triple quotes
    if (!inString) {
      if (stripped.substring(i, i + 3) === '"""' || stripped.substring(i, i + 3) === "'''") {
        inString = true
        stringQuote = stripped.substring(i, i + 3)
        result += stringQuote
        i += 3
        continue
      }
      if (char === '"' || char === "'") {
        inString = true
        stringQuote = char
        result += char
        i++
        continue
      }
    } else {
      if (stringQuote.length === 3 && stripped.substring(i, i + 3) === stringQuote) {
        inString = false
        result += stringQuote
        i += 3
        continue
      }
      if (stringQuote.length === 1 && char === stringQuote) {
        inString = false
        result += char
        i++
        continue
      }
    }

    if (!inString && char === '#') {
      const nextLF = stripped.indexOf('\n', i)
      const nextCR = stripped.indexOf('\r', i)

      let nextNewline = -1
      if (nextLF !== -1 && nextCR !== -1) {
        nextNewline = Math.min(nextLF, nextCR)
      } else {
        nextNewline = Math.max(nextLF, nextCR)
      }

      if (nextNewline === -1) {
        break // Rest of the line is a comment, end of string
      }
      i = nextNewline // Skip to newline
      continue
    }

    result += char
    i++
  }

  return result
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
 * @param {string} code - The Python code to validate
 * @returns {ValidationResult} Validation result
 */
export function validatePythonCode(code: string): ValidationResult {
  if (!code) return { valid: true }

  // Normalize code to NFKC (matching Python's internal identifier normalization)
  // and handle line continuations
  const normalizedCode = code.normalize('NFKC').replace(/\\(\r\n|\r|\n)/g, '')

  // Strip safe strings and comments to focus on logic
  const strippedCode = stripPythonCommentsAndStrings(normalizedCode)

  // 1. Property-Safe Deny Patterns (Keywords banned as references/assignments UNLESS properties)
  // e.g. eval() is banned, but model.eval() is allowed.
  // Note: __getattribute__ is in strict deny, so obj.__getattribute__ is also banned.
  const propertySafeKeywords = [
    'eval',
    'exec',
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
    '__class__',
    '__base__',
    '__dict__',
    '__traceback__',
    'tb_frame',
    'f_globals',
    'f_locals',
    'f_back',
    'f_builtins',
    'f_code',
    'gi_frame',
    'cr_frame',
    'ag_frame',
  ]
  const globalRegex = new RegExp(`\\b(${globalKeywords.join('|')})\\b`)
  if (globalRegex.test(strippedCode)) {
    return {
      valid: false,
      error: 'Security Error: Usage of dangerous built-ins, modules, or internals is restricted.',
    }
  }

  // 3. Import Deny Patterns (Specific module imports)
  // We need to catch these modules whether they are imported via 'import x', 'from x',
  // or as part of a comma-separated list like 'import math, js'.
  const dangerousModules = ['js', 'pyodide', 'micropip']
  const dangerousModulesStr = dangerousModules.join('|')

  // Pattern 1: `import ... module ...`
  // Matches "import", then anything up to the module name, as long as it doesn't cross a newline or semicolon.
  // We use `\b` to ensure we match the exact module name.
  const importRegex = new RegExp(`\\bimport\\b[^;\\n]*\\b(${dangerousModulesStr})\\b`)

  // Pattern 2: `from module ...`
  // Matches "from", then the module name.
  const fromRegex = new RegExp(`\\bfrom\\b\\s+(${dangerousModulesStr})\\b`)

  if (importRegex.test(strippedCode) || fromRegex.test(strippedCode)) {
    return {
      valid: false,
      error:
        'Security Error: Direct access to internal modules (js, pyodide, micropip) is restricted.',
    }
  }

  return { valid: true }
}
