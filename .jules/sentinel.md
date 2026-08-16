## 2024-08-16 - Prevent Reverse Tabnabbing in Mermaid Diagrams
**Vulnerability:** External links rendered inside Mermaid diagrams via `foreignObject` integration points were lacking `target="_blank"` and `rel="noopener noreferrer"`.
**Learning:** Even though DOMPurify sanitizes standard HTML blocks, dynamic SVG integration points like `<foreignObject>` can contain standard anchor tags that might skip global link-safety checks if they're generated deeply inside a third-party graph library wrapper.
**Prevention:** Always use localized DOMPurify hooks (to avoid polluting global state) when using `innerHTML` on SVGs/HTML from third-party graph generators, ensuring specific rules like `target="_blank"` and `rel="noopener noreferrer"` are enforced on all dynamically rendered anchors.
