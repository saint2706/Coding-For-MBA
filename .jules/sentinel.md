## 2025-02-18 - Python Regex Validation Bypass
**Vulnerability:** The initial Python code validation used regexes that required an opening parenthesis after function names (e.g., `getattr\s*\(`), allowing bypasses via variable assignment (e.g., `g = getattr; g(...)`).
**Learning:** Regex-based validation for code is fragile against obfuscation unless it strictly blocks identifiers using word boundaries (`\bkeyword\b`) rather than specific usage patterns.
**Prevention:** Use strict identifier blocklists (`\bgetattr\b`) instead of usage patterns, even if it increases false positives for strings/comments, when a proper AST parser is not available.
