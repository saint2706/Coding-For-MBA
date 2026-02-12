## 2024-05-22 - Missing SRI for Critical Dependency
**Vulnerability:** The Pyodide runtime script was loaded from a CDN without Subresource Integrity (SRI) validation. This could allow a compromised CDN to inject malicious code into the application context, potentially stealing user data or mining cryptocurrency.
**Learning:** External dependencies loaded at runtime via `script` tags bypass build-time security checks. Because Pyodide is loaded lazily and not part of the bundle, it was overlooked during standard dependency auditing.
**Prevention:** Always use SRI hashes for any external scripts. Create a helper function like `loadScript` that enforces integrity checks for known external resources.
