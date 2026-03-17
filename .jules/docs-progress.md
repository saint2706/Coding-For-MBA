# Docs Progress Log

- **[2026-03-13] Markdown Links & Link Checker configuration**
  - Replaced broken dummy email links `mailto:company.com` and `mailto:a@a.com` with `example.com` standards.
  - Replaced broken external Markdown links with working URLs (e.g. `https://hightouch.com/blog/reverse-etl`).
  - Created an `mlc_config.json` configuration file to ignore websites that return false positives (403 or 0 codes) from anti-bot mechanisms.
  - Successfully passed `markdown-link-check` script, `npm run lint`, and tests.

- **[2026-03-XX] JSDoc Improvements in Utilities**
  - Added missing typed JSDoc comments to `src/utils/safeStorage.ts`
  - Added missing typed JSDoc comments to `src/utils/prefetchRoutes.ts`
  - Added missing typed JSDoc comments to `src/utils/slug.ts`
  - Added missing typed JSDoc comments to `src/utils/rehype-slug-custom.ts`
  - Added missing typed JSDoc comments to `src/utils/exerciseProgress.ts`
  - Reviewed and confirmed all other exported functions in `src/utils/` had correct JSDoc comments.
  - Ran format and lint to ensure everything complies with coding standards.

- **[2026-03-08] JSDoc Improvements in Stores**
  - Added missing typed JSDoc comments to `src/stores/gamificationStore.ts`
  - Added missing typed JSDoc comments to `src/stores/learningAnalyticsStore.ts`
  - Added missing typed JSDoc comments to `src/stores/quizStore.ts`
  - Added missing typed JSDoc comments to `src/stores/userPreferencesStore.ts`
  - Created a Python script `/home/jules/self_created_tools/check_jsdoc4.py` to identify missing JSDoc comments for exported functions and arrow functions across `src/stores/`.
- Updated README.md and CONTRIBUTING.md to reflect the new 140-day curriculum (incorporating Phases 10-12).
- Updated TSDoc tags for exported functions in `src/utils/codeSecurity.ts` and `src/utils/confetti.ts` for better clarity and API completeness.
