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

import { useEffect, useState } from 'react'

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
