/**
 * Security validation for Python code execution.
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates Python code for potential security risks before execution.
 *
 * Checks for:
 * - Direct access to the 'js' module (browser API access)
 * - Usage of __import__ for 'js'
 * - Dynamic imports via importlib
 * - String manipulation to bypass checks
 *
 * @param code - The Python code to validate
 * @returns Validation result
 */
export function validatePythonCode(code: string): ValidationResult {
  if (!code) return { valid: true }

  // Regex patterns to detect 'js' module imports and bypass attempts
  // We use \b to ensure we don't match 'json' or 'jsp' etc.
  const patterns = [
    /\bimport\s+js\b/, // import js
    /\bfrom\s+js\b/, // from js import ...
    /__import__\s*\(\s*['"]js['"]\s*\)/, // __import__('js')
    /\bimportlib\b/, // Any use of importlib (dynamic imports)
    /__import__\s*\([^)]*[+]/, // __import__ with concatenation (simple cases)
    /__import__\s*\(\s*chr/, // __import__(chr(...) - character obfuscation
    /__import__\s*\(\s*['"][^'"]*['"][^)]*\.[^)]*\)/, // __import__("...".method()) - string method calls
    /__builtins__\s*\.\s*__import__/, // __builtins__.__import__
  ]

  for (const pattern of patterns) {
    if (pattern.test(code)) {
      return {
        valid: false,
        error: "Security Error: Direct access to browser APIs via 'js' module is restricted.",
      }
    }
  }

  return { valid: true }
}
