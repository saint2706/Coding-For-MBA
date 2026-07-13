## 2026-07-13 - Carriage Return Comment Stripping Bypass
**Vulnerability:** Python comment parser relied only on `\n` to end comments, allowing attackers to hide malicious payloads behind a `\r` (carriage return).
**Learning:** Python runtime executes code separated by `\r`, making it a valid newline character for command injection bypass when simple line feeds are the only check.
**Prevention:** Use comprehensive newline detection parsing (`\n` and `\r`) or AST-based parsers instead of simple checks when validating code.
