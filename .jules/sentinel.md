## 2026-08-03 - Bypass Python Security Check with CR in Comments
**Vulnerability:** Python security validation bypass via carriage returns (`\r`) in comments.
**Learning:** `stripPythonCommentsAndStrings` stops stripping a comment at `\n` but the Python runtime treats `\r` (carriage return) as a valid newline as well. By inserting a `\r` within a comment, the remainder of the line is executed by Python, but stripped from the code before the regex check is applied, bypassing module bans like `import os`.
**Prevention:** Ensure the parser correctly recognizes `\r` as a newline character that ends a comment, just like `\n`.
