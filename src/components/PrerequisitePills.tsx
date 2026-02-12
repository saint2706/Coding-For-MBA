import { Link } from 'react-router-dom'
import { Lesson, getPrerequisiteLessons } from '../utils/contentLoader'

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
