# Sentinel Learnings

- Replacing `Math.random` with `crypto.getRandomValues` in contexts where true cryptographically secure numbers aren't needed (e.g. basic UI components and simple array selections) is security theater and can introduce crashes in Node SSR environments if `crypto` isn't imported correctly.
- Added array validation to local storage JSON parsing (`Array.isArray()`) to prevent array prototype pollution from bypassing object checks (CWE-20).

- Strengthened array type guards in local storage json parsing helpers (`src/stores/progressStore.ts`, `src/stores/learningAnalyticsStore.ts`) by explicitly checking `Array.isArray(value)`, preventing prototype pollution or logical bugs when JS evaluates `typeof []` as `'object'`.

-   [x] **[SECURITY] Dependency Fix**: Updated `basic-ftp` to version 5.3.0 to resolve a high severity Denial of Service (DoS) vulnerability via unbounded memory consumption (GHSA-rp42-5vxx-qpwr).

- **JSON Parsing & Validation:** When parsing JSON data from untrusted sources (like `localStorage`), it is crucial to explicitly validate the resulting object's shape before attempting to access its properties. `JSON.parse()` can return primitives, arrays, or objects. Relying on implicit assumptions (e.g., `const parsed = JSON.parse(val)` and accessing `parsed.property`) can lead to type errors, application crashes, or even prototype pollution vectors if not carefully handled. Explicit checks like `typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null` provide critical defensive depth.
- Fixed JSON-LD XSS vulnerability by properly escaping `<` as a single backslash unicode escape sequence instead of double backslash string.
## Fixed Critical JSON-LD XSS Vulnerability

- **Severity**: CRITICAL
- **Vulnerability**: XSS via JSON-LD injection in `dangerouslySetInnerHTML`
- **Fix**: Replaced single backslash `replace(/</g, <)` with double backslash `replace(/</g, \u003c)` in `src/components/SEOHead.tsx` and `src/components/MasteryCheck.tsx`.
- **Learning**: In JavaScript string literals, a single backslash followed by `u003c` is evaluated immediately as the literal `<` character by the JS parser, breaking JSON-LD safety and introducing an XSS vector when parsing `dangerouslySetInnerHTML`. Double backslashes (`\\u003c`) properly emit the string `\u003c` ensuring `<` is escaped safely.
