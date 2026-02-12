/**
 * Skeleton Component
 *
 * Loading placeholder components that show animated skeletons
 * while content is being fetched.
 */

/**
 * Props for the Skeleton component.
 *
 * @property variant - Visual style variant (text, heading, card, block)
 * @property width - Optional custom width
 * @property height - Optional custom height
 * @property count - Number of skeleton elements to render (default: 1)
 */
interface SkeletonProps {
  variant?: 'text' | 'heading' | 'card' | 'block'
  width?: string
  height?: string
  count?: number
}

/**
 * Skeleton loading placeholder component.
 *
 * Displays animated skeleton placeholders in various styles while
 * content is loading. Supports multiple variants and custom dimensions.
 *
 * @param variant - Style of skeleton (text, heading, card, or block)
 * @param width - Custom width value
 * @param height - Custom height value
 * @param count - Number of skeleton items to render
 * @returns One or more skeleton placeholder elements
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
 * @returns A full-page loading skeleton
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
