## 2026-08-15 - Secure Links in DOMPurify
**Vulnerability:** Reverse Tabnabbing in Mermaid Diagrams
**Learning:** DOMPurify sanitization in MermaidDiagram.tsx did not enforce `target="_blank"` and `rel="noopener noreferrer"` on generated links. This could allow malicious links inside diagrams to exploit reverse tabnabbing vulnerabilities.
**Prevention:** Always instantiate a local DOMPurify object and use `addHook` for `afterSanitizeAttributes` to enforce secure link attributes when rendering unstrusted content, taking care not to pollute the global DOMPurify state.
