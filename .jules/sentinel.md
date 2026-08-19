## 2025-02-14 - Prevent Reverse Tabnabbing in Mermaid Diagrams
**Vulnerability:** External links inside mermaid diagrams rendered node/edge labels as HTML inside `<foreignObject>` lacked `target="_blank"` and `rel="noopener noreferrer"`.
**Learning:** Even when using DOMPurify for HTML sanitization, if external links are allowed, they need the `rel="noopener noreferrer"` attributes to protect against reverse tabnabbing (where the new tab can access the original window object).
**Prevention:** Always add a DOMPurify hook to modify links and enforce `rel="noopener noreferrer"` along with `target="_blank"`. Use a localized DOMPurify instance `DOMPurify(window)` so hooks do not pollute the global DOMPurify state.
