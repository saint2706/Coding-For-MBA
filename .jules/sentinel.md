## 2025-07-08 - Fix Carriage Return Comment Bypass in Python Validation
**Vulnerability:** A critical security vulnerability was discovered in `stripPythonCommentsAndStrings` where comments were only stripped up to the `\n` character. Attackers could use a carriage return `\r` to bypass the security scanner because the parser considered the rest of the file a comment and removed it from validation, but Pyodide executed the code following the `\r`.
**Learning:** Python treats `\r` as a valid newline character. String parsing logic that strips comments must handle both `\n` and `\r`.
**Prevention:** Always use regex or robust character checking for newlines `\r` and `\n` instead of `indexOf('\n')` when stripping code comments for validation.
