## 2025-05-18 - Client-Side DoS via Output\n**Vulnerability:** Unbounded Python stdout/stderr in Pyodide execution allowed browser hangs via large output (e.g. infinite loops).\n**Learning:** Client-side execution environments (WASM) still need resource constraints (output size, time) to prevent UI freezing.\n**Prevention:** Enforce strict output length limits in execution wrappers (hooks)

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
