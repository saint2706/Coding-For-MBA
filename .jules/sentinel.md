# Sentinel Learnings

- Replacing `Math.random` with `crypto.getRandomValues` in contexts where true cryptographically secure numbers aren't needed (e.g. basic UI components and simple array selections) is security theater and can introduce crashes in Node SSR environments if `crypto` isn't imported correctly.
- Added array validation to local storage JSON parsing (`Array.isArray()`) to prevent array prototype pollution from bypassing object checks (CWE-20).

- Strengthened array type guards in local storage json parsing helpers (`src/stores/progressStore.ts`, `src/stores/learningAnalyticsStore.ts`) by explicitly checking `Array.isArray(value)`, preventing prototype pollution or logical bugs when JS evaluates `typeof []` as `'object'`.
