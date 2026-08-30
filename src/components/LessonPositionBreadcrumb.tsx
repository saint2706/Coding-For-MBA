/**
 * LessonPositionBreadcrumb — pinned "Day N of Total · Phase X" readout.
 *
 * Appears once the lesson masthead scrolls out of view, so long lessons
 * keep a sense of position in the curriculum without re-showing the full
 * editorial header. Tracks masthead visibility via IntersectionObserver
 * rather than a scroll listener.
 */

import { useEffect, useState, type RefObject } from 'react'

interface LessonPositionBreadcrumbProps {
  day: string
  totalDays: number
  phaseNum: number
  mastheadRef: RefObject<HTMLElement | null>
}

export default function LessonPositionBreadcrumb({
  day,
  totalDays,
  phaseNum,
  mastheadRef,
}: LessonPositionBreadcrumbProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = mastheadRef.current
    if (!target || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) setVisible(!entry.isIntersecting)
    })
    observer.observe(target)

    return () => observer.disconnect()
  }, [mastheadRef])

  return (
    <div
      className={`lesson-position-breadcrumb ${visible ? 'is-visible' : ''}`.trim()}
      role="status"
      aria-hidden={!visible}
    >
      Day {day} of {totalDays} · Phase {String(phaseNum).padStart(2, '0')}
    </div>
  )
}
