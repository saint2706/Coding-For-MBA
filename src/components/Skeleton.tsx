/**
 * Skeleton Loader Component
 *
 * Displays animated placeholders for content while data is fetching.
 *
 * Key Responsibilities:
 * - Provide multiple variants (text, heading, card, block).
 * - Support custom dimensions and repeat counts.
 * - Render an accessible loading state (aria-hidden).
 * - Support a "boot sequence" styling mode (lines fade in top-to-bottom,
 *   staggered, instead of the default shimmer sweep) for the lesson route.
 */

import type { CSSProperties } from 'react'

interface SkeletonProps {
  /** Visual style variant. */
  variant?: 'text' | 'heading' | 'card' | 'block'
  /** Optional custom width (CSS string). */
  width?: string
  /** Optional custom height (CSS string). */
  height?: string
  /** Number of skeleton elements to render. */
  count?: number
  /**
   * Terminal-flavored "boot sequence" styling: each rendered line fades in
   * top-to-bottom with a staggered delay instead of the generic shimmer
   * sweep. Used for the lesson-content Suspense fallback only.
   */
  bootSequence?: boolean
  /**
   * Stagger index of the first rendered line, so several `Skeleton` calls
   * composed together (e.g. in `LessonSkeleton`) can share one continuous
   * top-to-bottom sequence instead of each restarting at 0.
   */
  bootIndex?: number
}

/**
 * Skeleton Loader Component
 *
 * Displays animated placeholders for content while data is fetching.
 *
 * @param {SkeletonProps} props - The component props.
 * @param {'text' | 'heading' | 'card' | 'block'} [props.variant='text'] - Visual style variant.
 * @param {string} [props.width] - Optional custom width (CSS string).
 * @param {string} [props.height] - Optional custom height (CSS string).
 * @param {number} [props.count=1] - Number of skeleton elements to render.
 * @param {boolean} [props.bootSequence=false] - Use the staggered boot-sequence fade instead of shimmer.
 * @param {number} [props.bootIndex=0] - Stagger index of the first rendered line.
 * @returns {JSX.Element} The rendered skeleton items.
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  bootSequence = false,
  bootIndex = 0,
}: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i)

  const className = `skeleton skeleton-${variant}${bootSequence ? ' skeleton-boot' : ''}`

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={className}
          style={
            bootSequence
              ? ({ width, height, '--index': bootIndex + i } as CSSProperties)
              : { width, height }
          }
          aria-hidden="true"
        />
      ))}
    </>
  )
}

/**
 * Full-page skeleton shown during lazy-load Suspense.
 *
 * Displays a comprehensive page skeleton with heading, metadata pills,
 * content blocks, and text lines to match typical page layout.
 *
 * Used as the default Suspense fallback for every route except `/lesson/:dayNum`,
 * which uses `LessonSkeleton` instead — see `App.tsx`.
 *
 * @returns {JSX.Element} A full-page loading skeleton
 */
export function PageSkeleton() {
  return (
    <div className="page-skeleton" role="status" aria-label="Loading page">
      <Skeleton variant="heading" width="60%" />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <Skeleton variant="text" width="80px" height="28px" />
        <Skeleton variant="text" width="100px" height="28px" />
        <Skeleton variant="text" width="60px" height="28px" />
      </div>
      <Skeleton variant="block" height="200px" />
      <Skeleton variant="text" count={5} />
      <Skeleton variant="block" height="120px" />
      <Skeleton variant="text" count={3} />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

/**
 * Boot-sequence skeleton for the lesson-content Suspense fallback.
 *
 * Lesson content loading has no internal async phase of its own — lesson data
 * is looked up synchronously from the bundled curriculum content the moment
 * `Lesson` renders (see `src/utils/contentLoader.ts#getLesson`). The only
 * asynchronous step is the route-level code-split chunk for the `Lesson` page
 * itself (`React.lazy` in `App.tsx`), so this is a Suspense fallback, not an
 * internal loading state owned by `Lesson.tsx`.
 *
 * Lines are shaped and ordered to roughly match `EditorialLessonHeader`
 * (kicker, headline, deck, byline) plus the header controls row and the
 * markdown article that follow it. Each line fades in top-to-bottom with a
 * staggered delay (terminal "boot print" feel) instead of the generic
 * shimmer sweep.
 *
 * The root uses the same `page-container lesson-with-toc` classes as the
 * real lesson page (`src/pages/Lesson.tsx`) — not the generic `page-skeleton`
 * wrapper `PageSkeleton` uses — and includes a TOC-column placeholder, so the
 * container width and 2-column grid are identical between the loading and
 * loaded states. Without this, the skeleton (single-column, `--content-max-width`
 * wide) would be ~292px narrower than the real `.lesson-with-toc` layout
 * (`--content-max-width` + 260px sidebar + gap), producing a width jump and a
 * 1→2 column reflow the instant real content mounts.
 *
 * @returns {JSX.Element} A lesson-shaped loading skeleton
 */
export function LessonSkeleton() {
  let cursor = 0
  const nextIndex = (count = 1) => {
    const start = cursor
    cursor += count
    return start
  }

  return (
    <div
      className="page-container lesson-with-toc lesson-skeleton"
      role="status"
      aria-label="Loading lesson"
    >
      <div className="lesson-main-content">
        {/* Breadcrumb */}
        <Skeleton variant="text" bootSequence bootIndex={nextIndex()} width="32%" height="12px" />
        {/* Kicker (Phase N · Phase title) */}
        <Skeleton variant="text" bootSequence bootIndex={nextIndex()} width="40%" height="12px" />
        {/* Headline */}
        <Skeleton
          variant="heading"
          bootSequence
          bootIndex={nextIndex()}
          width="72%"
          height="2.25rem"
        />
        {/* Deck (one-sentence objective), two lines */}
        <Skeleton variant="text" bootSequence bootIndex={nextIndex()} width="92%" height="18px" />
        <Skeleton variant="text" bootSequence bootIndex={nextIndex()} width="58%" height="18px" />
        {/* Byline (Day · Level · Run time · Read) */}
        <div style={{ display: 'flex', gap: '1.75rem', marginTop: '0.875rem' }}>
          <Skeleton
            variant="text"
            bootSequence
            bootIndex={nextIndex()}
            width="50px"
            height="14px"
          />
          <Skeleton
            variant="text"
            bootSequence
            bootIndex={nextIndex()}
            width="60px"
            height="14px"
          />
          <Skeleton
            variant="text"
            bootSequence
            bootIndex={nextIndex()}
            width="70px"
            height="14px"
          />
          <Skeleton
            variant="text"
            bootSequence
            bootIndex={nextIndex()}
            width="60px"
            height="14px"
          />
        </div>
        {/* Header controls (complete button, mastery badge, tags) */}
        <div
          style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', alignItems: 'center' }}
        >
          <Skeleton
            variant="text"
            bootSequence
            bootIndex={nextIndex()}
            width="140px"
            height="40px"
          />
          <Skeleton
            variant="text"
            bootSequence
            bootIndex={nextIndex()}
            width="120px"
            height="24px"
          />
          <Skeleton
            variant="text"
            bootSequence
            bootIndex={nextIndex()}
            width="70px"
            height="24px"
          />
        </div>
        {/* Article content */}
        <Skeleton variant="block" bootSequence bootIndex={nextIndex()} height="180px" />
        <Skeleton variant="text" bootSequence bootIndex={nextIndex(4)} count={4} />
        <Skeleton variant="block" bootSequence bootIndex={nextIndex()} height="120px" />
        <Skeleton variant="text" bootSequence bootIndex={nextIndex(3)} count={3} />
        {/* Prev/next lesson nav */}
        <div style={{ display: 'flex', gap: '1px', marginTop: '1.5rem' }}>
          <Skeleton variant="text" bootSequence bootIndex={nextIndex()} width="50%" height="80px" />
          <Skeleton variant="text" bootSequence bootIndex={nextIndex()} width="50%" height="80px" />
        </div>
      </div>
      {/* Table-of-contents column placeholder — reserves the real layout's
          260px sidebar track so the grid stays 2-column through the swap to
          real content, even though the real TOC (`src/components/TableOfContents.tsx`)
          may end up rendering nothing if the lesson has too few headings. */}
      <aside className="toc" aria-hidden="true">
        <Skeleton variant="text" bootSequence bootIndex={nextIndex()} width="55%" height="12px" />
        <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
          <Skeleton
            variant="text"
            bootSequence
            bootIndex={nextIndex(4)}
            count={4}
            width="85%"
            height="12px"
          />
        </div>
      </aside>
      <span className="sr-only">Loading lesson…</span>
    </div>
  )
}
