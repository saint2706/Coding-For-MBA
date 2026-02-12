/**
 * PrerequisitePills Component
 *
 * Displays prerequisite lessons as clickable pill-shaped links
 * to help users understand lesson dependencies.
 */

import { Link } from 'react-router-dom'
import { Lesson, getPrerequisiteLessons } from '../utils/contentLoader'

/**
 * Prerequisite pills navigation component.
 *
 * Shows a horizontal list of prerequisite lesson links that users
 * should complete before the current lesson. Returns null if no prerequisites exist.
 *
 * @param lesson - The current lesson to show prerequisites for
 * @returns Prerequisite navigation bar or null if no prerequisites
 */
export default function PrerequisitePills({ lesson }: { lesson: Lesson }) {
  const prereqs = getPrerequisiteLessons(lesson)

  if (prereqs.length === 0) return null

  return (
    <div className="prerequisite-bar" role="navigation" aria-label="Prerequisite lessons">
      <span className="prerequisite-label">Prerequisites</span>
      {prereqs.map((p) => (
        <Link
          key={p.day}
          to={`/lesson/${p.day}`}
          className="prerequisite-pill"
          title={`Day ${p.day}: ${p.title}`}
        >
          Day {p.day}: {p.title}
        </Link>
      ))}
    </div>
  )
}
