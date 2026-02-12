interface SkeletonProps {
    variant?: 'text' | 'heading' | 'card' | 'block'
    width?: string
    height?: string
    count?: number
}

export default function Skeleton({ variant = 'text', width, height, count = 1 }: SkeletonProps) {
    const items = Array.from({ length: count }, (_, i) => i)

    const className = `skeleton skeleton-${variant}`

    return (
        <>
            {items.map((i) => (
                <div
                    key={i}
                    className={className}
                    style={{ width, height }}
                    aria-hidden="true"
                />
            ))}
        </>
    )
}

/** Full-page skeleton shown during lazy-load Suspense */
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
