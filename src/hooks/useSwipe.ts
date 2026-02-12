/**
 * Swipe Gesture Hook
 *
 * Detects horizontal swipe gestures for touch-enabled devices.
 * Useful for implementing mobile navigation patterns.
 */

import { useEffect, useRef, useCallback } from 'react'

/**
 * Configuration options for swipe gesture detection.
 */
interface SwipeConfig {
  /** Callback fired when user swipes left */
  onSwipeLeft?: () => void
  /** Callback fired when user swipes right */
  onSwipeRight?: () => void
  /** Minimum horizontal distance in pixels to trigger a swipe (default: 60) */
  threshold?: number
}

/**
 * Custom hook to detect horizontal swipe gestures on touch devices.
 *
 * Attaches touch event listeners to detect left/right swipes with a
 * configurable threshold. Only triggers when horizontal movement is
 * dominant over vertical movement.
 *
 * @param config - Configuration object with swipe callbacks and threshold
 * @returns Ref to attach to the swipeable element
 *
 * @example
 * ```tsx
 * const swipeRef = useSwipe({
 *   onSwipeLeft: () => navigate('/next'),
 *   onSwipeRight: () => navigate('/prev'),
 *   threshold: 80
 * })
 * return <div ref={swipeRef}>Swipeable content</div>
 * ```
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
