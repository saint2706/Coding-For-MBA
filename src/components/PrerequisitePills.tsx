/**
 * Prerequisite Links
 *
 * Displays a list of lesson dependencies as navigation pills.
 *
 * Key Responsibilities:
 * - Identify prerequisite lessons from the current lesson object.
 * - Render clickable links to those lessons.
 * - Alert the user if they are jumping ahead of the curriculum order.
 */

import { Link } from 'react-router-dom'
import { Lesson, getPrerequisiteLessons } from '../utils/contentLoader'

/**
 * Prerequisite Links Component
 *
 * Displays a list of lesson dependencies as navigation pills.
 *
 * @param {Object} props - The component props.
 * @param {Lesson} props.lesson - The current lesson to find prerequisites for.
 * @returns {JSX.Element | null} A container with prerequisite pills, or null if none exist.
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
