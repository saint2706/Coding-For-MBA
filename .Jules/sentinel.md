## 2025-02-27 - Blocking Dynamic Imports in Pyodide
**Vulnerability:** Regex-based sanitization of Python code (`import js`) was bypassed using `importlib.import_module('js')` and `sys.modules['js']` because `importlib` and `sys` were allowed.
**Learning:** In a browser-based Python environment like Pyodide, restricting `import js` is insufficient if the environment provides mechanisms to dynamically load modules (`importlib`) or access pre-loaded modules (`sys.modules`).
**Prevention:** Explicitly block `importlib`, `sys.modules`, and other dynamic loading mechanisms in the sanitization layer, or use a more robust sandboxing method (e.g., AST analysis or restricting the Pyodide environment itself).

## 2025-02-27 - Python Line Continuation Bypass
**Vulnerability:** Regex-based sanitization of Python code was bypassed using line continuations (e.g., `import \\\njs`), which split keywords across lines while remaining valid Python syntax.
**Learning:** Regex patterns like `\bimport\s+js\b` often fail to account for language-specific syntax features like line continuations that can fragment tokens.
**Prevention:** Normalize input code by removing line continuations or other formatting artifacts before applying regex-based security checks, or use an AST-based parser that understands the language structure.
