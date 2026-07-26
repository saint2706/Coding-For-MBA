## 2024-07-26 - [DOMPurify Bypass]
**Vulnerability:** DOMPurify <=3.4.11 has a bypass via `CUSTOM_ELEMENT_HANDLING` bypassing `afterSanitizeElements`.
**Learning:** Outdated dompurify dependency in package.json exposed this vulnerability. The vulnerability was found through `npm audit`.
**Prevention:** Regularly run `npm audit` and update dependencies to their patched versions.
