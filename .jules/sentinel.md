## 2025-02-14 - Fix command injection bypass in Python comment stripping
**Vulnerability:** Python code execution could bypass the security checks by hiding dangerous imports/functions behind carriage return `\r` characters disguised as comments.
**Learning:** The Python parser treats `\r` as well as `\n` as valid newlines, so our regex/parsing for removing comments that only looked for `\n` was flawed.
**Prevention:** Always consider both `\r` and `\n` as newlines when implementing comment stripping or parsing logic for multi-line languages like Python.
