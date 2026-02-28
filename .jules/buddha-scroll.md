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

---
*May the Lighthouse score be 100 and the Googlebot find peace in our structure.*
