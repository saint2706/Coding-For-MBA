## 2024-05-24 - Carriage Return Bypass in Comment Stripping
**Vulnerability:** Python code validation could be bypassed by hiding malicious payloads behind a carriage return (`\r`) in a comment. The comment stripping logic only recognized `\n` as a newline.
**Learning:** When sanitizing code or stripping comments for security checks, always ensure the parser treats both carriage return (`\r`) and line feed (`\n`) characters as valid newlines. Relying only on `\n` allows attackers to hide code that the Python runtime will execute.
**Prevention:** Use a regex `[\r\n]` to detect newlines instead of just `\n`, or use a proper AST parser.
