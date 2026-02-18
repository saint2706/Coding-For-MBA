## 2025-02-18 - Python Sandbox Bypass via Introspection
**Vulnerability:** Python sandbox escape via `__globals__`, `__subclasses__` and string concatenation.
**Learning:** Regex-based sanitization is inherently fragile against string manipulation (e.g., `'__glo' + 'bals__'`). Blocking access to critical introspection attributes like `__globals__` and `__subclasses__` is crucial to prevent access to the global scope and sensitive modules.
**Prevention:** Explicitly block `__globals__`, `__subclasses__`, `__bases__`, `__mro__`, `__getattribute__`, `__code__`, and `__closure__`. Consider AST-based validation for more robust security in the future.
