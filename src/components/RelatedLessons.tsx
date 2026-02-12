/**
 * RelatedLessons Component
 *
 * Displays a grid of related lessons based on shared tags and concepts.
 * Helps users discover connected content.
 */

import { Link } from 'react-router-dom'
import { Lesson, getRelatedLessons, difficultyConfig } from '../utils/contentLoader'

/**
 * Related lessons recommendation component.
 *
 * Shows up to 4 related lessons based on shared tags with the current lesson.
 * Each card displays day number, title, difficulty badge, and tags.
 * Shared tags are visually highlighted.
 *
 * @param lesson - The current lesson to find related lessons for
 * @returns Related lessons grid or null if no related lessons exist
 */
export default function RelatedLessons({ lesson }: { lesson: Lesson }) {
  const related = getRelatedLessons(lesson, 4)

  if (related.length === 0) return null

  const myTags = new Set((lesson.tags as string[]) || [])

  return (
    <section className="related-lessons" aria-label="Related lessons">
      <h2 className="related-lessons-title">🔗 Related Lessons</h2>
      <div className="related-lessons-grid">
        {related.map((r) => {
          const diff = difficultyConfig[r.difficulty || 'beginner'] || difficultyConfig.beginner!
          const tags = (r.tags as string[]) || []
          return (
            <Link key={r.day} to={`/lesson/${r.day}`} className="related-lesson-card">
              <span className="related-lesson-day">
                Day {r.day} · Phase {r.phase}
              </span>
              <span className="related-lesson-title">{r.title}</span>
              <div className="related-lesson-meta">
                <span
                  className="related-lesson-badge"
                  style={{ color: diff.color, background: diff.bg }}
                >
                  {diff.label}
                </span>
                <div className="related-lesson-tags">
                  {tags.slice(0, 3).map((tag) => (
                    <span key={tag} className={`related-tag${myTags.has(tag) ? ' shared' : ''}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
