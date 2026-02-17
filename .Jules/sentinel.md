## 2025-02-27 - Blocking Dynamic Imports in Pyodide
**Vulnerability:** Regex-based sanitization of Python code (`import js`) was bypassed using `importlib.import_module('js')` and `sys.modules['js']` because `importlib` and `sys` were allowed.
**Learning:** In a browser-based Python environment like Pyodide, restricting `import js` is insufficient if the environment provides mechanisms to dynamically load modules (`importlib`) or access pre-loaded modules (`sys.modules`).
**Prevention:** Explicitly block `importlib`, `sys.modules`, and other dynamic loading mechanisms in the sanitization layer, or use a more robust sandboxing method (e.g., AST analysis or restricting the Pyodide environment itself).
