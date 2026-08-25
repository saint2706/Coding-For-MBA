/**
 * Related Lessons Component
 *
 * Suggests relevant content based on the current lesson's tags and concepts.
 *
 * Key Responsibilities:
 * - Fetch top-ranked related lessons.
 * - Render a grid of lesson cards with metadata (difficulty, phase).
 * - Highlight shared tags for visual connection.
 */

import { Link } from 'react-router-dom'
import { LinkSimple } from '@phosphor-icons/react'
import { Lesson, getRelatedLessons, difficultyConfig } from '../utils/contentLoader'

/**
 * Related Lessons Component
 *
 * Suggests relevant content based on the current lesson's tags and concepts.
 *
 * @param {Object} props - The component props.
 * @param {Lesson} props.lesson - The current lesson to find related content for.
 * @returns {JSX.Element | null} A grid of related lesson cards, or null if none exist.
 */
export default function RelatedLessons({ lesson }: { lesson: Lesson }) {
  const related = getRelatedLessons(lesson, 4)

  if (related.length === 0) return null

  const myTags = new Set((lesson.tags as string[]) || [])

  return (
    <section className="related-lessons" aria-label="Related lessons">
      <h2 className="related-lessons-title">
        <LinkSimple aria-hidden="true" /> Related Lessons
      </h2>
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
