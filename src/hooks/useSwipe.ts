import { useEffect, useRef, useCallback } from 'react'

interface SwipeConfig {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    threshold?: number
}

/**
 * Hook to detect horizontal swipe gestures.
 * Returns a ref to attach to the swipeable element.
 */
export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 60 }: SwipeConfig) {
    const startX = useRef(0)
    const startY = useRef(0)
    const elementRef = useRef<HTMLDivElement>(null)

    const handleTouchStart = useCallback((e: TouchEvent) => {
        startX.current = e.touches[0]!.clientX
        startY.current = e.touches[0]!.clientY
    }, [])

    const handleTouchEnd = useCallback(
        (e: TouchEvent) => {
            const endX = e.changedTouches[0]!.clientX
            const endY = e.changedTouches[0]!.clientY
            const diffX = endX - startX.current
            const diffY = endY - startY.current

            // Only trigger if horizontal swipe is dominant
            if (Math.abs(diffX) < threshold || Math.abs(diffX) < Math.abs(diffY)) return

            if (diffX < 0) {
                onSwipeLeft?.()
            } else {
                onSwipeRight?.()
            }
        },
        [onSwipeLeft, onSwipeRight, threshold],
    )

    useEffect(() => {
        const el = elementRef.current
        if (!el) return

        el.addEventListener('touchstart', handleTouchStart, { passive: true })
        el.addEventListener('touchend', handleTouchEnd, { passive: true })

        return () => {
            el.removeEventListener('touchstart', handleTouchStart)
            el.removeEventListener('touchend', handleTouchEnd)
        }
    }, [handleTouchStart, handleTouchEnd])

    return elementRef
}
