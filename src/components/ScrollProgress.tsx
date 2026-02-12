/**
 * ScrollProgress Component
 *
 * A fixed progress bar at the top of the page showing reading progress
 * as the user scrolls through content.
 */

import { useEffect, useState } from 'react'

/**
 * Scroll progress indicator component.
 *
 * Displays a thin horizontal bar at the top of the viewport that fills
 * from left to right as the user scrolls down the page.
 * Includes proper ARIA attributes for accessibility.
 *
 * @returns A scroll progress bar element
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="scroll-progress"
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
