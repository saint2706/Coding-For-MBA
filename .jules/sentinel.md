## 2024-05-18 - [Security] Fix DOMPurify Vulnerability
**Vulnerability:** DOMPurify <3.4.12 was vulnerable to a bypass via CUSTOM_ELEMENT_HANDLING where allowed custom elements could bypass the `afterSanitizeElements` check.
**Learning:** In a heavily markdown/interactive component driven site, relying on older versions of sanitization libraries like dompurify can allow XSS if custom elements are used or parsed unexpectedly.
**Prevention:** Keep security-critical dependencies (like DOMPurify) updated.
