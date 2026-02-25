# 🧘 Buddha Scroll (SEO/GEO Log)

## [GEO] Added `llms.txt`
- Created `public/llms.txt` to provide a structured site architecture for AI agents.
- Includes key routes and concept overview.

## [PERF] Optimized Markdown Images
- Updated `MarkdownRenderer.tsx` to automatically apply `loading="lazy"` and `decoding="async"` to all images.
- This improves LCP and saves bandwidth for images below the fold.
- Verified with unit test `src/components/__tests__/MarkdownRendererImages.test.tsx`.

## [GEO] Dynamic `llms.txt` Generation
- Created `scripts/generate-llms-txt.js` to automatically generate a rich `llms.txt` based on content.
- Updated `package.json` to run this script during build.
- Added `<link rel="alternate" type="text/markdown" href="/llms.txt" />` to `index.html` for discovery.
- `llms.txt` now includes full curriculum structure with lessons and concepts.

## [GEO] Full URL Resolution
- Updated `generate-llms-txt.js` to use full URLs (with hash fragment) instead of relative paths.
- This ensures that agents crawling `llms.txt` can correctly resolve links to the SPA hosted on GitHub Pages subpath (`/Coding-For-MBA/`).
