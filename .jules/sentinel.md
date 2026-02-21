## 2025-05-18 - Client-Side DoS via Output\n**Vulnerability:** Unbounded Python stdout/stderr in Pyodide execution allowed browser hangs via large output (e.g. infinite loops).\n**Learning:** Client-side execution environments (WASM) still need resource constraints (output size, time) to prevent UI freezing.\n**Prevention:** Enforce strict output length limits in execution wrappers (hooks)

## 2025-05-20 - Regex Validation Bypass in Python Runner
**Vulnerability:** `validatePythonCode` regex checks for `exec(` or `eval(` allowed bypass via variable assignment (`e = exec; e(...)`), while blocking safe usage in strings.
**Learning:** Simple regex matching on raw code is insufficient for security validation. Stripping strings solves false positives but creates new vulnerabilities if executable string formats (like f-strings) are stripped.
**Prevention:** Strip comments and safe string literals, but **preserve f-strings** to ensure executable code inside them remains visible to strict keyword blacklists.
