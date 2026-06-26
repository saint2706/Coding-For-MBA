## 2024-05-18 - Fix XSS Vulnerability in MermaidDiagram
**Vulnerability:** The `MermaidDiagram` component directly assigns SVG string output from the `mermaid` library to `containerRef.current.innerHTML` without sanitization. Malicious markdown containing crafted Mermaid syntax could potentially inject arbitrary JavaScript (XSS) if the mermaid library's built-in strict security level fails to prevent all vectors or allows `<script>`/`onload` injection.
**Learning:** Even when using "strict" security modes in third-party rendering libraries, outputting raw HTML/SVG via `innerHTML` remains a risk.
**Prevention:** Always wrap SVG/HTML outputs bound for `innerHTML` with `DOMPurify.sanitize(svg)` to provide defense in depth against XSS.
