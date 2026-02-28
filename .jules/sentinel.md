## 2025-05-18 - Client-Side DoS via Output
**Vulnerability:** Unbounded Python stdout/stderr in Pyodide execution allowed browser hangs via large output (e.g. infinite loops).
**Learning:** Client-side execution environments (WASM) still need resource constraints (output size, time) to prevent UI freezing.
**Prevention:** Enforce strict output length limits in execution wrappers (hooks)

## 2025-05-20 - Regex Validation Bypass in Python Runner
**Vulnerability:** `validatePythonCode` regex checks for `exec(` or `eval(` allowed bypass via variable assignment (`e = exec; e(...)`), while blocking safe usage in strings.
**Learning:** Simple regex matching on raw code is insufficient for security validation. Stripping strings solves false positives but creates new vulnerabilities if executable string formats (like f-strings) are stripped.
**Prevention:** Strip comments and safe string literals, but **preserve f-strings** to ensure executable code inside them remains visible to strict keyword blacklists.

## 2025-05-20 - Interactive Function DoS
**Vulnerability:** Unrestricted use of `input()`, `help()`, and `breakpoint()` in client-side Python (Pyodide) caused UI freezes (waiting for prompt) or unexpected runtime states.
**Learning:** Functions that block execution or require user interaction are denial-of-service vectors in synchronous WASM environments.
**Prevention:** Explicitly block interactive keywords (`input`, `breakpoint`, `help`, `quit`, `exit`) in the validation layer.

## 2025-05-25 - Pyodide Internals Exposure
**Vulnerability:** The `pyodide` and `micropip` modules were not blocked, allowing access to `pyodide.code.run_js` (arbitrary JS execution) and package installation from external sources.
**Learning:** Pyodide exposes powerful internals (like JS interop) via its own module, which must be explicitly blocked alongside the `js` module in sandboxed environments.
**Prevention:** Add `pyodide` and `micropip` to the import blocklist in the code validation layer.

## 2025-05-30 - Recursion Limit DoS
**Vulnerability:** Default recursion limits in Python (usually 1000) combined with browser stack limits can cause browser tab crashes or hangs when users write deep recursion.
**Learning:** Client-side WASM runs on the main thread's stack. Deep recursion can exceed browser limits before Python's limit is hit, or simply freeze the UI.
**Prevention:** Enforce a lower recursion limit (e.g., 500) by prepending `sys.setrecursionlimit(500)` to user code execution.

## 2025-05-30 - Dangerous Built-ins Access
**Vulnerability:** `open()`, `compile()`, and `memoryview()` were allowed, presenting risks of file system access (virtual), code object creation (potential escape), and raw memory manipulation.
**Learning:** Even in a virtualized environment, file access and low-level memory operations increase the attack surface for escapes or side-channel attacks.
**Prevention:** Explicitly block `open`, `compile`, and `memoryview` in the validation layer, while ensuring method calls (e.g. `obj.open()`) remain valid.

## 2025-06-05 - Interactive Help and Internal Attributes
**Vulnerability:** Interactive functions like `copyright()`, `credits()`, and `license()` can trigger interactive prompts that hang the Pyodide environment. Additionally, access to internal attributes like `__loader__` and `__spec__` could expose system modules even after `del sys`.
**Learning:** Standard Python interactive helpers are dangerous in non-interactive environments. Internal attributes can serve as bridges to deleted modules.
**Prevention:** Explicitly block `copyright`, `credits`, `license` calls and global access to `__loader__` and `__spec__`.

## 2025-06-10 - Regex Bypass via Control Characters and Obfuscated Schemes
**Vulnerability:** Simple regex checks for schemes (`^[a-z]+:`) could be bypassed by inserting control characters (e.g., `jav\nscript:`) or using schemes not in the whitelist that browsers might execute or treat unpredictably. Also, broad regexes could flag relative URLs with colons (e.g., `search?q=filter:value`) as unsafe schemes.
**Learning:** URL validation must robustly handle obfuscation (stripping control characters) and strictly define what constitutes a scheme to avoid false positives on valid relative paths.
**Prevention:**
1.  Strip all control characters (ASCII 0-31, 127) before validation.
2.  Use a strict regex `^[a-zA-Z][^:/?#]*:` to identify schemes, ensuring that characters like `/`, `?`, `#` terminate the scheme detection (preventing relative paths from being misidentified).

## 2025-06-12 - Python Sandbox Bypass via Aliasing
**Vulnerability:** Banning function calls like `input(...)` via regex `input\s*\(` allowed attackers to bypass restrictions by aliasing the function (e.g., `f = input; f()`).
**Learning:** Regex-based function call detection is insufficient when functions are first-class objects. Blocking dangerous built-ins must be done at the identifier level (banning the word `input`), while carefully allowing property access (e.g., `obj.input`) to maintain usability.
**Prevention:** Moved critical functions (`input`, `open`, `exit`, `quit`, `help`, `getattr`, etc.) to a `propertySafeKeywords` list, which bans them as standalone identifiers (`\binput\b` not preceded by `.`) but permits them as properties.

## 2025-06-12 - CSP Hardening
**Vulnerability:** Missing `upgrade-insecure-requests` in Content Security Policy could allow mixed content issues if the site is served over HTTPS but requests HTTP resources.
**Prevention:** Added `upgrade-insecure-requests` to the CSP meta tag to force all requests to HTTPS.

## 2025-06-15 - Regex Bypass via Multiple Imports
**Vulnerability:** The previous regex checks for internal module imports (like `\bimport\s+js\b`) could be bypassed by importing multiple modules in a single statement (e.g., `import math, js`), allowing dangerous module execution.
**Learning:** Simple import regexes must account for comma-separated module lists and other valid Python import syntaxes.
**Prevention:** Replaced literal regexes with a broader `\bimport\b[^;\n]*\b(js|pyodide|micropip)\b` and `\bfrom\b\s+(js|pyodide|micropip)\b` pattern to securely catch all occurrences of restricted modules in import statements.
