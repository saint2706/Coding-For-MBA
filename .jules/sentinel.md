## 2023-11-20 - [Fix Code Security Bypass using Carriage Return]
**Vulnerability:** The code security validator `stripPythonCommentsAndStrings` fails to handle carriage return `\r` as a newline character when stripping comments, allowing attackers to hide malicious code behind a carriage return inside a comment.
**Learning:** Python treats `\r` (carriage return) as a valid newline character. If the code parser only looks for `\n`, malicious code can bypass the validator by using `\r`.
**Prevention:** Use `\n` and `\r` together or parse all newline tokens natively when manually iterating and identifying end of line symbols in custom parsers.
