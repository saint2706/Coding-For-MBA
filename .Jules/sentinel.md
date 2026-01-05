## 2024-05-22 - IDOR Vulnerability in Progress Tracking

**Vulnerability:** Insecure Direct Object Reference (IDOR) allowed users to modify progress for any other user by changing the `user_id` in the request body.
**Learning:** The application trusted the client-provided `user_id` in the request body/path instead of validating it against the authenticated session cookie. Anonymous mode's logic (overwriting user_id) inadvertently protected against this, masking the issue in basic testing.
**Prevention:** Always validate that the target resource's owner matches the currently authenticated user (from session/token), ignoring or rejecting client-provided IDs if they mismatch.

## 2025-12-21 - Stored XSS in Progress Status

**Vulnerability:** The `record_progress` endpoint accepted arbitrary strings for `status`, allowing Stored XSS attacks via payloads like `<img src=x onerror=alert(1)>`. The frontend rendered this status unsafely using `innerHTML`.
**Learning:** Never trust user input to conform to expected values without strict validation. Relying on frontend limitations or documentation is insufficient. Pydantic models with `str` types do not validate content; use `Enum` or validators.
**Prevention:** Use strictly typed Enums for categorical data in API models. This provides automatic validation and documentation. Ensure frontends escape all dynamic content.

## 2025-05-23 - Cookie Tampering and Broken Access Control

**Vulnerability:** The `learner_user_id` cookie was stored as plaintext, allowing users to impersonate others by modifying the cookie value. Additionally, `verify_user_access` flawed logic permitted access to any user's data if no cookie was provided in Anonymous mode.
**Learning:** `HttpOnly` and `SameSite` flags are insufficient for session integrity; cookies acting as session tokens must be cryptographically signed. Access control checks must explicitly handle "no session" states as "deny" unless public access is intended.
**Prevention:** Use `itsdangerous` or similar libraries to sign session cookies. Ensure authorization logic defaults to "deny" (fail closed) when authentication credentials are missing or invalid.

## 2024-04-20 - \[HIGH\] IP Spoofing via X-Forwarded-For

**Vulnerability:** The rate limiter blindly trusted the `X-Forwarded-For` header without verification, allowing attackers to bypass rate limits by spoofing the header with random IPs.
**Learning:** Naively parsing `X-Forwarded-For` in application code is a common vulnerability. Middleware or load balancers should handle IP resolution securely. If done in app code, it must be gated behind a `TRUSTED_PROXIES` configuration.
**Prevention:** Always default to ignoring `X-Forwarded-For`. Only enable it if the deployment environment guarantees the header is authentic (e.g., from a trusted load balancer).

## 2026-01-01 - Content Security Policy (CSP) Bypass Risks

**Vulnerability:** The application's CSP was overly permissive, missing critical directives like `object-src 'none'`, `base-uri 'self'`, and `form-action 'self'`. This left the application potentially vulnerable to object injection attacks (e.g., Flash/Java applets), base tag hijacking, and unauthorized form submissions.
**Learning:** Default "secure" headers often miss defense-in-depth directives. Modern CSP requires explicit restrictions on all resource types, not just scripts and styles.
**Prevention:** Implement a strict, granular CSP that explicitly denies unused features (`object-src 'none'`, `frame-ancestors 'none'`) and restricts necessary ones to 'self' or specific trusted domains.
