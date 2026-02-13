## 2024-05-22 - Missing SRI for Critical Dependency
**Vulnerability:** The Pyodide runtime script was loaded from a CDN without Subresource Integrity (SRI) validation. This could allow a compromised CDN to inject malicious code into the application context, potentially stealing user data or mining cryptocurrency.
**Learning:** External dependencies loaded at runtime via `script` tags bypass build-time security checks. Because Pyodide is loaded lazily and not part of the bundle, it was overlooked during standard dependency auditing.
**Prevention:** Always use SRI hashes for any external scripts. Create a helper function like `loadScript` that enforces integrity checks for known external resources.

## 2026-02-13 - Link Attribute Security Bypass
**Vulnerability:** External link protection (forcing `target="_blank"` and `rel="noopener noreferrer"`) in the Markdown renderer could be bypassed by user-supplied `rel` attributes. The `LinkComponent` spread user-provided props *after* applying security defaults, allowing malicious or unsafe `rel` values to override the secure configuration.
**Learning:** Component composition order matters critically for security. When spreading `...props`, always ensure security-critical attributes (like `rel` for external links) take precedence or are explicitly merged/sanitized *after* the spread.
**Prevention:** Destructure and remove security-sensitive props from user input before spreading, or explicitly set them after spreading user props. Use helper functions to construct safe attribute sets.
