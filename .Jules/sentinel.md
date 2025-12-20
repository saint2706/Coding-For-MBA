## 2024-05-22 - IDOR Vulnerability in Progress Tracking
**Vulnerability:** Insecure Direct Object Reference (IDOR) allowed users to modify progress for any other user by changing the `user_id` in the request body.
**Learning:** The application trusted the client-provided `user_id` in the request body/path instead of validating it against the authenticated session cookie. Anonymous mode's logic (overwriting user_id) inadvertently protected against this, masking the issue in basic testing.
**Prevention:** Always validate that the target resource's owner matches the currently authenticated user (from session/token), ignoring or rejecting client-provided IDs if they mismatch.
