/**
 * Skeleton Loader Component
 *
 * Displays animated placeholders for content while data is fetching.
 *
 * Key Responsibilities:
 * - Provide multiple variants (text, heading, card, block).
 * - Support custom dimensions and repeat counts.
 * - Render an accessible loading state (aria-hidden).
 */

interface SkeletonProps {
  /** Visual style variant. */
  variant?: 'text' | 'heading' | 'card' | 'block'
  /** Optional custom width (CSS string). */
  width?: string
  /** Optional custom height (CSS string). */
  height?: string
  /** Number of skeleton elements to render. */
  count?: number
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
 * @returns {JSX.Element} The rendered skeleton items.
 */
export default function Skeleton({ variant = 'text', width, height, count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i)

  const className = `skeleton skeleton-${variant}`

  return (
    <>
      {items.map((i) => (
        <div key={i} className={className} style={{ width, height }} aria-hidden="true" />
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
 * @returns {JSX.Element} A full-page loading skeleton.
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
