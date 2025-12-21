## 2024-05-22 - IDOR Vulnerability in Progress Tracking
**Vulnerability:** Insecure Direct Object Reference (IDOR) allowed users to modify progress for any other user by changing the `user_id` in the request body.
**Learning:** The application trusted the client-provided `user_id` in the request body/path instead of validating it against the authenticated session cookie. Anonymous mode's logic (overwriting user_id) inadvertently protected against this, masking the issue in basic testing.
**Prevention:** Always validate that the target resource's owner matches the currently authenticated user (from session/token), ignoring or rejecting client-provided IDs if they mismatch.

## 2025-12-21 - Stored XSS in Progress Status
**Vulnerability:** The `record_progress` endpoint accepted arbitrary strings for `status`, allowing Stored XSS attacks via payloads like `<img src=x onerror=alert(1)>`. The frontend rendered this status unsafely using `innerHTML`.
**Learning:** Never trust user input to conform to expected values without strict validation. Relying on frontend limitations or documentation is insufficient. Pydantic models with `str` types do not validate content; use `Enum` or validators.
**Prevention:** Use strictly typed Enums for categorical data in API models. This provides automatic validation and documentation. Ensure frontends escape all dynamic content.
