## 2025-02-18 - Caching DOM lookups in scroll events
**Learning:** High frequency events like `scroll` (even if throttled via `requestAnimationFrame`) can become performance bottlenecks if they contain expensive DOM queries like `document.querySelector`.
**Action:** Always cache the result of DOM queries inside high-frequency event listeners (e.g. using a `useRef` in React). Ensure you have a strategy to repopulate the cache if the element might remount, such as using `document.body.contains(ref.current)` or resetting the ref when props change.

## 2025-02-18 - Typescript and Vite strict dependency requirements
**Learning:** Randomly downgrading or modifying `package.json` dependencies (like typescript) during verification can cause build failures with vite plugins (e.g. `@vitejs/plugin-react`). This project has strict version alignment requirements.
**Action:** Never modify `package.json` or `tsconfig.json` without explicit instruction. If a tool like `tsc` goes missing due to a mocked environment state, install it locally just to verify, but always revert the lockfile and package.json via `git restore package.json package-lock.json` before submitting.
