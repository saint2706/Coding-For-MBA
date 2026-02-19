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
 * Checks for usage of dangerous built-in functions, modules, and identifiers.
 * This validator uses a strict allowlist/blocklist approach.
 *
 * It intentionally blocks usage of these keywords anywhere in the code (including strings/comments)
 * to prevent obfuscation bypasses (e.g., using getattr('__import__') or eval()).
 *
 * @param code - The Python code to validate
 * @returns Validation result
 */
export function validatePythonCode(code: string): ValidationResult {
  if (!code) return { valid: true }

  // Normalize code to handle line continuations
  const normalizedCode = code.replace(/\\(\r\n|\r|\n)/g, '')

  const dangerousPatterns = [
    // Core restrictions
    { pattern: /\bimport\s+js\b/, message: "Direct access to browser APIs via 'js' module is restricted." },
    { pattern: /\bfrom\s+js\b/, message: "Direct access to browser APIs via 'js' module is restricted." },

    // Dangerous Built-ins (Strict Blocklist)
    // We use (?<!\.) to allow method calls (e.g. model.eval()) but block direct usage.
    { pattern: /\b__import__\b/, message: "Usage of '__import__' is restricted." },
    { pattern: /(?<!\.)\beval\b/, message: "Usage of 'eval' is restricted." },
    { pattern: /(?<!\.)\bexec\b/, message: "Usage of 'exec' is restricted." },
    { pattern: /(?<!\.)\bglobals\b/, message: "Usage of 'globals' is restricted." },
    { pattern: /(?<!\.)\blocals\b/, message: "Usage of 'locals' is restricted." },
    { pattern: /(?<!\.)\bgetattr\b/, message: "Usage of 'getattr' is restricted." },
    { pattern: /(?<!\.)\bsetattr\b/, message: "Usage of 'setattr' is restricted." },
    { pattern: /(?<!\.)\bdelattr\b/, message: "Usage of 'delattr' is restricted." },
    { pattern: /(?<!\.)\bcompile\b/, message: "Usage of 'compile' is restricted." },
    { pattern: /(?<!\.)\binput\b/, message: "Usage of 'input' is restricted in this environment." },
    { pattern: /(?<!\.)\bopen\b/, message: "Usage of 'open' is restricted." },

    // Restricted Modules (Strict Identifier Blocklist)
    { pattern: /\bimportlib\b/, message: "Usage of 'importlib' is restricted." },
    { pattern: /\bsys\b/, message: "Usage of 'sys' module is restricted." },
    { pattern: /\bos\b/, message: "Usage of 'os' module is restricted." },
    { pattern: /\bsubprocess\b/, message: "Usage of 'subprocess' module is restricted." },
    { pattern: /\bbuiltins\b/, message: "Usage of 'builtins' module is restricted." },
    { pattern: /\b__builtins__\b/, message: "Access to '__builtins__' is restricted." },

    // Introspection attributes
    { pattern: /\b__globals__\b/, message: "Access to '__globals__' is restricted." },
    { pattern: /\b__subclasses__\b/, message: "Access to '__subclasses__' is restricted." },
    { pattern: /\b__bases__\b/, message: "Access to '__bases__' is restricted." },
    { pattern: /\b__mro__\b/, message: "Access to '__mro__' is restricted." },
    { pattern: /\b__getattribute__\b/, message: "Access to '__getattribute__' is restricted." },
    { pattern: /\b__code__\b/, message: "Access to '__code__' is restricted." },
    { pattern: /\b__closure__\b/, message: "Access to '__closure__' is restricted." },
  ]

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(normalizedCode)) {
      return { valid: false, error: `Security Error: ${message}` }
    }
  }

  return { valid: true }
}
