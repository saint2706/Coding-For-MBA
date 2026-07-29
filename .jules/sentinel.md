## 2026-04-26 - [Bypass Fix] Carriage Return Comment Injection
**Vulnerability:** Python code validation could be bypassed by injecting malicious code after a carriage return (\r) in a comment. The stripPythonCommentsAndStrings function only recognized \n as a newline, allowing \r to hide code from the security scanner while the Python runtime executed it.
**Learning:** Python treats \r as a valid newline, but simple parsers often only look for \n. Attackers can hide malicious payloads behind \r inside comments.
**Prevention:** Always use an AST or handle both \r and \n when stripping comments in custom security parsers.
