# 🧘 Buddha Scroll: SEO & GEO Improvements

> "The code that is seen by no one is as if it were never written."

This scroll records the harmonization of the `Coding-For-MBA` codebase for human speed and machine intelligence.

## 📜 Log

### [Date: Current] - Initial Harmonization

**Priority Areas:**
1.  **Speed (Velocity)**: Optimizing bundle splitting for lesson content.
2.  **SEO (Visibility)**: Enhancing structured data for Curriculum and Exercises.

**Changes:**
-   [x] **Bundle Optimization**: Splitting `lesson-content` into per-phase chunks in `vite.config.ts`.
-   [x] **Structured Data**: Adding `ItemList` schema to Curriculum page.
-   [x] **Structured Data**: Adding `CollectionPage` schema to Exercises page.

### [Date: Current] - Advanced GEO and Core Web Vitals Harmonization

**Priority Areas:**
1.  **Speed (Velocity)**: LCP optimization for hero/primary images.
2.  **GEO (Intelligence)**: Enhancing `Article` schemas for deeper AI indexing.

**Changes:**
-   [x] **[GEO] Structured Data**: Replaced `LearningResource` with `['LearningResource', 'TechArticle']` in `buildLessonSchema` and added `headline` property to ensure rich snippet readiness.
-   [x] **[PERF] LCP Optimization**: Refactored `MarkdownRenderer` to respect `fetchpriority="high"`, stripping standard lazy-loading when present to prevent LCP penalties.


### [Date: Current] - Site Architecture Optimization for AI Manifest

**Priority Areas:**
1.  **GEO (Intelligence)**: Updating `llms.txt` for AI crawlers.

**Changes:**
-   [x] **[GEO] Site Architecture**: Updated `scripts/generate-llms-txt.js` to output a clean, concise `# Site Architecture` section, making the manifest highly optimized for AI agents without breaking existing routes.

### [Date: Current] - Advanced GEO and Semantic HTML Fixes

**Priority Areas:**
1.  **SEO (Visibility)**: Semantic HTML hierarchy.
2.  **GEO (Intelligence)**: Expanding Article JSON-LD schema.

**Changes:**
-   [x] **[SEO] Semantic HTML**: Fixed `<h3>` tag rendering inside `Curriculum.tsx` phase headers to an `<h2>` to maintain strict h1-h6 hierarchy and prevent skip-level headings.
-   [x] **[GEO] Structured Data**: Added `Article` to the schema types in `buildLessonSchema` within `seoSchemas.ts`. Also added `author`, `publisher`, and `image` fallback properties to improve rich snippet visibility.
-   [x] **[PERF] Image CLS**: Provided fallback `alt="Course image"` text in the `MarkdownRenderer.tsx` ImageComponent.

---
*May the Lighthouse score be 100 and the Googlebot find peace in our structure.*

### [Date: Current] - JSON-LD Structured Data XSS Prevention

**Priority Areas:**
1.  **GEO (Intelligence)**: Securely injecting JSON-LD schema into the `<head>`.
2.  **Security**: Preventing XSS vulnerabilities from literal `<` evaluation in script tags.

**Changes:**
-   [x] **[GEO][SEO] Structured Data XSS Fix**: Fixed the `.replace(/</g, '\\u003c')` call inside `src/components/SEOHead.tsx` to `.replace(/</g, '\\\\u003c')`. This ensures that `\u003c` is properly output in the serialized JS string, satisfying React's `dangerouslySetInnerHTML` escaping requirements without breaking JSON parsers.

### [Date: Current] - LCP and JSON-LD Integrity

**Priority Areas:**
1.  **Speed (Velocity)**: LCP element lazy-loading prevention.
2.  **GEO (Intelligence)**: Correcting JSON-LD script escaping logic.

**Changes:**
-   [x] **[PERF] LCP Optimization**: Extracted `fetchpriority` and `fetchPriority` in `ImageComponent` inside `src/components/MarkdownRenderer.tsx` and removed them from the remaining spread `props` to prevent `loading="lazy"` overrides.
-   [x] **[GEO] Structured Data**: Reverted incorrect double escaping in `dangerouslySetInnerHTML` for JSON-LD schemas inside `src/components/SEOHead.tsx` to ensure `\u003c` evaluates properly in the JS context.

## Changes Implemented - Mastery Check GEO
- Added `FAQPage` schema to `src/utils/seoSchemas.ts`.
- Integrated `FAQPage` schema into mastery checks to improve GEO discoverability of Q&As.

### [Date: Current] - Static Route Descriptions for AI Manifest

**Priority Areas:**
1.  **GEO (Intelligence)**: Updating `llms.txt` descriptions for static pages to improve AI contextual understanding.

**Changes:**
-   [x] **[GEO] Site Architecture**: Updated `scripts/generate-llms-txt.js` to provide explicit AI-readable descriptions for static pages (e.g. Home, Curriculum, Exercises) in the generated `public/llms.txt`.
