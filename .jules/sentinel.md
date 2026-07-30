## 2025-02-14 - Fix Pyodide comment stripping bypass
**Vulnerability:** The `stripPythonCommentsAndStrings` function in `src/utils/codeSecurity.ts` only treated `\n` as a comment terminator. An attacker could hide malicious code behind a carriage return (`\r`) in a comment, which the parser would ignore, but the Python runtime would execute.
**Learning:** When sanitizing code (e.g., Python) before security validation, always ensure the parser treats both carriage return (`\r`) and line feed (`\n`) characters as valid newlines. Relying only on `\n` allows attackers to hide malicious code behind a `\r`, which the Python runtime will execute.
**Prevention:** Explicitly check for both `\n` and `\r` when determining the end of a comment line in custom parsers, or use an AST parser.
