# Sentinel Learnings

- Replacing `Math.random` with `crypto.getRandomValues` in contexts where true cryptographically secure numbers aren't needed (e.g. basic UI components and simple array selections) is security theater and can introduce crashes in Node SSR environments if `crypto` isn't imported correctly.
- Added array validation to local storage JSON parsing (`Array.isArray()`) to prevent array prototype pollution from bypassing object checks (CWE-20).

- Strengthened array type guards in local storage json parsing helpers (`src/stores/progressStore.ts`, `src/stores/learningAnalyticsStore.ts`) by explicitly checking `Array.isArray(value)`, preventing prototype pollution or logical bugs when JS evaluates `typeof []` as `'object'`.

-   [x] **[SECURITY] Dependency Fix**: Updated `basic-ftp` to version 5.3.0 to resolve a high severity Denial of Service (DoS) vulnerability via unbounded memory consumption (GHSA-rp42-5vxx-qpwr).

- **JSON Parsing & Validation:** When parsing JSON data from untrusted sources (like `localStorage`), it is crucial to explicitly validate the resulting object's shape before attempting to access its properties. `JSON.parse()` can return primitives, arrays, or objects. Relying on implicit assumptions (e.g., `const parsed = JSON.parse(val)` and accessing `parsed.property`) can lead to type errors, application crashes, or even prototype pollution vectors if not carefully handled. Explicit checks like `typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null` provide critical defensive depth.
- Fixed JSON-LD XSS vulnerability by properly escaping `<` as a single backslash unicode escape sequence instead of double backslash string.

### XSS Vulnerability in JSON-LD Injection
- **Date:** 2026-05-08
- **Vulnerability:** Cross-Site Scripting (XSS) via broken string escaping.
- **Component:** `SEOHead.tsx` and `MasteryCheck.tsx` in `dangerouslySetInnerHTML`.
- **Description:** The JSON-LD schema strings were originally replacing `<` characters with `\\u003c`. This injected literal backslashes into the inner HTML, which breaks JSON-LD parsing and leaves the content vulnerable to XSS injection if unsanitized data enters the JSON.
- **Fix:** Changed the replacement string to `\u003c`, which translates to the correct `<` sequence in the parsed JavaScript string and prevents XSS by replacing all `<` tokens.
- **Severity:** High
- [x] **[SECURITY] Dependency Fix**: Updated `basic-ftp` to version 5.3.1 in `package.json` overrides to resolve a high severity DoS vulnerability via unbounded memory consumption (GHSA-rpmf-866q-6p89).
