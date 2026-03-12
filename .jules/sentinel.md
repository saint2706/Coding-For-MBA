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
- Added `__class__`, `__base__`, and `__dict__` to the list of `globalKeywords` inside `validatePythonCode` to prevent Python Sandbox Escapes using Dunder Method Reflection/Object Instantiation (e.g. `().__class__.__base__.__dict__["__subclasses__"]`).

## 2025-06-20 - Pyodide Sandbox Escape via Traceback Frames
**Vulnerability:** A vulnerability existed where an attacker could use an exception's `__traceback__` property to traverse frame objects (`tb_frame`, `f_globals`, `f_builtins`), ultimately gaining access to the blocked `__builtins__` dictionary. For example: `e.__traceback__.tb_frame.f_globals["__builtins__"]`. Since string literals are stripped prior to the keyword validation in `validatePythonCode`, the keyword `__builtins__` was hidden in the string index, bypassing the blocklist.
**Learning:** Pyodide's JavaScript/Python boundary and execution environment expose raw traceback objects on exceptions. Frame objects contain a full reference back to global and builtin namespaces. Blocking the entry points like `globals()` is insufficient if those same namespaces can be reflected through raised exceptions.
**Prevention:**
- Added `__traceback__`, `tb_frame`, `f_globals`, `f_back`, `f_builtins`, and `f_code` to the `globalKeywords` strict deny list in `validatePythonCode`. This effectively blocks exception-based traceback traversal and prevents retrieving frame locals/globals to execute arbitrary code.
- Fixed XSS vulnerability in JSON-LD structured data generation. When using `dangerouslySetInnerHTML` to inject JSON inside a `<script>` tag, replacing `<` with `\u003c` prevents arbitrary execution of script tags. Crucially, exactly two backslashes (`'\\u003c'`) must be used in the JS string so it is rendered correctly as `\u003c`. Using four backslashes (`'\\\\u003c'`) evaluates to the string `\\u003c` rather than escaping the `<` character properly.

## 2025-06-25 - Core Infrastructure Security Audit
**Vulnerability:** No new vulnerabilities found. A comprehensive audit of `SEOHead.tsx`, `codeSecurity.ts`, `MarkdownRenderer.tsx`, and `index.html` was conducted to ensure they meet strict security standards.
**Learning:** React's `dangerouslySetInnerHTML` combined with proper JSON-LD escaping (`replace(/</g, '\\u003c')`), Pyodide string/comment stripping combined with Dunder Method blacklisting (`__class__`, `__subclasses__`), and strict Content Security Policy (`script-src 'self' 'unsafe-eval'`) together provide a defense-in-depth architecture.
**Prevention:**
- Confirmed that Pyodide string literal validation accurately protects execution contexts without breaking Python f-string logic.
- Confirmed `rehype-sanitize` prevents XSS within raw HTML embedded in Markdown.
- Validated `Content-Security-Policy` successfully restricts external connections to trusted CDNs and APIs (`connect-src`), mitigating client-side SSRF.
