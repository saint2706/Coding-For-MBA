/**
 * Scroll Progress Indicator
 *
 * A horizontal bar fixed to the top of the viewport indicating reading progress.
 *
 * Key Responsibilities:
 * - Calculate scroll percentage (scrollTop / (scrollHeight - clientHeight)).
 * - Update width style on scroll.
 * - Provide accessible progress role attributes.
 */

import { useEffect, useState, useRef } from 'react'

interface ScrollProgressProps {
  targetSelector?: string
  isLesson?: boolean
}

/**
 * Scroll Progress Indicator Component
 *
 * A horizontal bar fixed to the top of the viewport indicating reading progress.
 *
 * @param {ScrollProgressProps} props - The component props.
 * @param {string} [props.targetSelector] - Optional CSS selector for the scrollable container.
 * @param {boolean} [props.isLesson] - Indicates if the progress bar is used in a lesson context.
 * @returns {JSX.Element} The scroll progress bar widget.
 */
export default function ScrollProgress({ targetSelector, isLesson }: ScrollProgressProps) {
  const [progress, setProgress] = useState(0)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Reset cached element when targetSelector changes to prevent stale references
    elementRef.current = null

    let ticking = false

    const updateProgress = () => {
      let calcProgress = 0

      if (targetSelector) {
        // Cache querySelector result for performance since this runs on scroll
        if (!elementRef.current || !elementRef.current.isConnected) {
          elementRef.current = document.querySelector<HTMLElement>(targetSelector)
        }
        const element = elementRef.current
        if (element) {
          const rect = element.getBoundingClientRect()
          const elementHeight = element.clientHeight
          const windowHeight = window.innerHeight

          const scrollableDistance = elementHeight - windowHeight
          if (scrollableDistance <= 0) {
            calcProgress = 100
          } else {
            const scrolled = Math.max(0, -rect.top)
            calcProgress = (scrolled / scrollableDistance) * 100
            calcProgress = Math.max(0, Math.min(100, calcProgress))
          }
        } else {
          // Fallback if target is not found
          const scrollTop = window.scrollY
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          calcProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
        }
      } else {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        calcProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      }

      setProgress(calcProgress)
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress)
        ticking = true
      }
    }

    // Initial calculation
    updateProgress()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [targetSelector])

  return (
    <div
      className={`scroll-progress ${isLesson ? 'lesson-progress' : ''}`.trim()}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div className="scroll-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  )
}
