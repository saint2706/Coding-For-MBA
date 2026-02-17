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
 * - All forms of importlib imports (prevents dynamic module loading)
 * - Access to sys.modules (prevents accessing pre-loaded modules)
 * - Access to os.system, os.popen (prevents command execution)
 * - Import of subprocess module (prevents command execution)
 * - String manipulation to bypass checks
 * - Access to dangerous built-in functions (eval, exec, etc.)
 *
 * Note: This is a defense-in-depth approach using regex patterns. While not
 * foolproof, it catches common bypass attempts. For a production environment,
 * consider using AST-based validation or sandboxing.
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
    /\bimport\s+importlib\b/, // import importlib - prevents dynamic module loading
    /\bfrom\s+importlib\b/, // from importlib - prevents accessing import_module
    /__import__\s*\(\s*['"]importlib['"]\s*\)/, // __import__('importlib')
    /\bimportlib\s*\.\s*import_module\s*\(/, // importlib.import_module() - catch usage if pre-imported
    /\bimport\s+sys\b/, // import sys - prevents access to sys.modules and other internals
    /\bfrom\s+sys\b/, // from sys import ... - prevents access to sys.modules and other internals
    /__import__\s*\(\s*['"]sys['"]\s*\)/, // __import__('sys')
    /\bsys\.modules\b/, // sys.modules - prevents accessing loaded modules like 'js'
    /\bimport\s+os\b/, // import os - prevents importing os for command execution
    /\bfrom\s+os\b/, // from os import ... - prevents importing os for command execution
    /\bos\.system\b/, // os.system - prevents command execution
    /\bos\.popen\b/, // os.popen - prevents command execution
    /\bimport\s+subprocess\b/, // import subprocess - prevents command execution
    /\bfrom\s+subprocess\b/, // from subprocess import ... - prevents command execution
    /__import__\s*\(\s*['"][^'"]*['"]\s*\+\s*['"][^'"]*['"]/, // __import__("..." + "...") - string concatenation
    /__import__\s*\(\s*chr\s*\(/, // __import__(chr(...) - character obfuscation
    /__import__\s*\(\s*['"][^'"]*['"]\s*\.\s*(lower|upper|strip|replace|format)\s*\(/, // __import__("...".method()) - string method obfuscation
    /__builtins__\s*\.\s*__import__/, // __builtins__.__import__
    /\bimport\s+builtins\b/, // import builtins - prevents builtins.eval() bypass
    /\bfrom\s+builtins\s+import/, // from builtins import - prevents direct builtin imports
    /(?<!\.)\b(eval|exec|globals|locals|getattr|setattr|delattr|hasattr|vars|dir|compile|open)\s*\(/, // built-in functions that allow bypass
    /\b__builtins__\b/, // access to __builtins__
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
