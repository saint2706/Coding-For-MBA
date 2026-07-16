## 2024-07-16 - Prevent Python Comment Bypass via Carriage Returns
**Vulnerability:** The Python comment parsing logic only recognized line feeds (`\n`) as the end of a comment, allowing malicious payloads hidden behind carriage returns (`\r`) to execute.
**Learning:** Python runtime interprets both `\r` and `\n` as valid line endings. Security parsers must handle both to avoid bypasses, as relying on only one allows attackers to hide executable code.
**Prevention:** Always use robust newline parsing or an AST-based state machine for security validations, handling all platform-specific line endings.
