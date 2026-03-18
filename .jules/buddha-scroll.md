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

### [Date: Current] - Semantic HTML Fixes

**Priority Areas:**
1.  **SEO (Visibility)**: Strict semantic HTML hierarchy.

**Changes:**
-   [x] **[SEO] Semantic HTML Fixes**: Converted top-level `<h2>` tags to `<h1>` across multiple pages (`Curriculum.tsx`, `ProgressDashboard.tsx`, `Exercises.tsx`, `Review.tsx`, `CaseStudies.tsx`) to ensure strict `h1`-`h6` hierarchy. This improves screen reader accessibility and helps search engines properly understand the page outline.

### [Date: Current] - Static Route Descriptions for AI Manifest

**Priority Areas:**
1.  **GEO (Intelligence)**: Updating `llms.txt` descriptions for static pages to improve AI contextual understanding.

**Changes:**
-   [x] **[GEO] Site Architecture**: Updated `scripts/generate-llms-txt.js` to provide explicit AI-readable descriptions for static pages (e.g. Home, Curriculum, Exercises) in the generated `public/llms.txt`.

## Enhanced llms.txt generation for better GEO context
- Updated `scripts/generate-llms-txt.js` to extract and incorporate the `description` frontmatter field for phases and individual lessons.
- Added descriptive fallback strings where descriptions are omitted.
- Provides explicit sentences in `llms.txt` helping AI crawlers index and understand the routing structure effectively, fulfilling "Vector Friendliness".

### [Date: Current] - Deep Semantic HTML Hierarchy Refactoring

**Priority Areas:**
1.  **SEO (Visibility)**: Perfect semantic HTML hierarchy and no skipped levels.
2.  **GEO (Intelligence)**: Ensured headings map gracefully to AI chunking outlines.

**Changes:**
-   [x] **[SEO] Semantic HTML Fixes**: Fixed heading tag hierarchy on `CaseStudies.tsx`, `Review.tsx`, `SearchResults.tsx`, `Exercises.tsx`, and `PhaseOverview.tsx` to prevent skip-level headings (e.g. going from `<h1>` directly to `<h3>` or `<h4>`).
## 🧘 Buddha: Added Product Schema & Updated llms.txt [SEO][GEO]
- Added `buildProductSchema` JSON-LD to `src/pages/Home.tsx` and `src/pages/Curriculum.tsx` to enrich structured data for search engines.
- Ran `node scripts/generate-llms-txt.js` to ensure the `llms.txt` manifest includes the latest content, ensuring GEO compatibility.

## 🧘 Buddha: Semantic HTML Hierarchy Refactoring [SEO][GEO]
- Fixed semantic heading hierarchy in `src/components/ExerciseWidget.tsx`, `src/components/MasteryCheck.tsx`, and `src/components/ExerciseCard.tsx` by changing `<h4>` to `<h3>` to prevent skipped heading levels.
- Regenerated `llms.txt` using `node scripts/generate-llms-txt.js` to ensure latest context is available for AI crawlers.
