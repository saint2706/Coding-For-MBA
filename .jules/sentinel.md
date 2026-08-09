## 2026-08-09 - Prevent Python Parser CRLF Comment Bypass
**Vulnerability:** Python allows `\r` (carriage return) as a newline character, but the comment-stripping logic only checked for `\n`. Attackers could hide malicious payloads like `eval()` after a `\r` inside a comment.
**Learning:** When sanitizing strings or comments, we must consider all newline sequences (`\r`, `\n`, `\r\n`) respected by the target parser.
**Prevention:** Ensure comment-stripping logic uses AST or checks for both `\r` and `\n` to prevent hiding executable code.
