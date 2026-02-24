# 🧘 Buddha Scroll (SEO/GEO Log)

## [GEO] Added `llms.txt`
- Created `public/llms.txt` to provide a structured site architecture for AI agents.
- Includes key routes and concept overview.

## [PERF] Optimized Markdown Images
- Updated `MarkdownRenderer.tsx` to automatically apply `loading="lazy"` and `decoding="async"` to all images.
- This improves LCP and saves bandwidth for images below the fold.
- Verified with unit test `src/components/__tests__/MarkdownRendererImages.test.tsx`.
