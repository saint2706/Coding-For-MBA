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

- Updated all curriculum references from 108-day to 140-day across SEO metadata, llms.txt, and UI components to accurately reflect the correct curriculum duration.
- Fixed JSON-LD stringification encoding in SEOHead.tsx to securely escape HTML tags.
- 2024-03-20: Updated hardcoded references from '108-day' to '140-day' in index.html, utils/seoSchemas.ts, and ProgressDashboard.tsx. Verified sitemap generation, llms.txt generation, JSON-LD escaping, and test suites.

## 🧘 Buddha: Added New Static Routes & Build Automation [SEO][GEO]
- Added `Search`, `Review`, and `Case Studies` static routes to `scripts/generate-llms-txt.js` to improve GEO discoverability.
- Updated `package.json` to automatically run `node scripts/generate-llms-txt.js` during the `build` and `analyze` steps.
- Regenerated `llms.txt` successfully with the new routes.

### [Date: Current] - Deep Semantic Refactor and CLS Optimization
**Priority Areas:**
1.  **Speed (Velocity)**: Font Hydration (CLS).
2.  **SEO (Visibility)**: Strict Semantic HTML Mapping.
3.  **GEO (Intelligence)**: Proper markdown structure extraction.

**Changes:**
-   [x] **[PERF] Font CLS Optimization**: Updated `index.html` Google Fonts external stylesheets to use `&display=swap` instead of `&display=block` to prevent Cumulative Layout Shift (CLS) during text hydration.
-   [x] **[SEO] Semantic HTML mapping**: Added explicit `<h4-h6>` heading mappings to `MarkdownRenderer.tsx` custom components mapping object to handle deeper heading levels generated from content, ensuring hierarchical integrity.
-   [x] **[QA] Visual Verification**: Setup Playwright tests to execute E2E visual smoke tests to verify visual integrity of the app against local development server (`verify.py`, `verify_lesson.py`).

## 🧘 Buddha: Fixed Build & Enhanced Sidebar Semantics [SEO][PERF]

- Ran `npm install` to resolve missing `tsc` dependency, allowing `npm run build` to succeed with no errors.
- Enhanced `src/components/Sidebar.tsx` by converting the `.sidebar-title` from a `<div>` to an `<h2>`. This provides a clearer document outline, improving accessibility (A11Y) for screen readers and semantic indexing (GEO) for AI agents.

### [Date: Current] - Build and Dependency Verification

**Priority Areas:**
1.  **Speed (Velocity)**: Build and pipeline integrity.
2.  **SEO (Visibility)**: Perfect HTML structure and valid SEO schemas.

**Changes:**
-   [x] **[PERF] Build Fix**: Installed missing dependencies via `npm install` to resolve the `tsc: not found` error, ensuring `npm run build` and `npm run analyze` pass without errors or warnings.
-   [x] **[GEO] Schema Validation**: Verified that all JSON-LD structured data is properly encoded to prevent XSS without corrupting the schemas (using the single backslash `\u003c` approach).
-   [x] **[SEO] Core Web Vitals**: Verified LCP elements are not lazy-loaded (`fetchpriority="high"`) and HTML heading hierarchy (h1-h6) is strictly maintained across all pages.
>> Fixed JSON-LD structure data script tag escaping issue by replacing `\\u003c` with `\u003c` to avoid breaking the schema and satisfy the Buddha persona.

### [Date: Current] - Deep Semantic Refactor and AI Content Discovery
**Priority Areas:**
1.  **GEO (Intelligence)**: Updating `llms.txt` descriptions for static pages to include "User Intent" explanations.
2.  **Speed (Velocity)**: LCP element lazy-loading prevention (`fetchpriority="high"` case-sensitivity).

**Changes:**
-   [x] **[GEO] Site Architecture**: Updated `scripts/generate-llms-txt.js` to provide explicit AI-readable descriptions for static pages (e.g. Home, Curriculum, Exercises) detailing "User Intent" in the generated `public/llms.txt`.
-   [x] **[PERF] LCP Optimization**: Refactored `MarkdownRenderer` to respect lowercase `fetchpriority="high"` attribute natively required by browsers, resolving case-sensitivity issues while keeping others lazy-loaded.

### [Date: Current] - Advanced GEO and Core Web Vitals Harmonization

**Changes:**
-   [x] **[PERF] LCP Optimization**: Removed lowercase `fetchpriority` from `ImgHTMLAttributes` and intercepted it in `MarkdownRenderer` to avoid React console warnings while successfully translating it to `fetchPriority` for eager loading. This prevents React DOM warnings while still allowing LCP eager loading.

### [Date: Current] - Deep JSON-LD Structured Data XSS Prevention

**Priority Areas:**
1.  **GEO (Intelligence)**: Securely injecting JSON-LD schema into the `<head>` and `MasteryCheck` component.
2.  **Security**: Preventing XSS vulnerabilities from literal `<` evaluation in script tags.

**Changes:**
-   [x] **[GEO][SEO] Structured Data XSS Fix**: Fixed the `.replace(/</g, '\\u003c')` call inside `src/components/SEOHead.tsx` and `src/components/MasteryCheck.tsx` to `.replace(/</g, '\\\\u003c')`. This ensures that `\u003c` is properly output in the serialized JS string, satisfying React's `dangerouslySetInnerHTML` escaping requirements without breaking JSON parsers.
- Added image to WebSite schema
- [GEO] Fixed JSON-LD escaping in SEOHead and MasteryCheck.
