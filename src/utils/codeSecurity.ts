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
 *
 * @param code - The Python code to validate
 * @returns Validation result
 */
export function validatePythonCode(code: string): ValidationResult {
  if (!code) return { valid: true }

  // Regex patterns to detect 'js' module imports
  // We use \b to ensure we don't match 'json' or 'jsp' etc.
  const patterns = [
    /\bimport\s+js\b/,                   // import js
    /\bfrom\s+js\b/,                     // from js import ...
    /__import__\s*\(\s*['"]js['"]\s*\)/, // __import__('js')
  ]

  for (const pattern of patterns) {
    if (pattern.test(code)) {
      return {
        valid: false,
        error: "Security Error: Direct access to browser APIs via 'js' module is restricted."
      }
    }
  }

  return { valid: true }
}
