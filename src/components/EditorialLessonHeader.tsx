/**
 * EditorialLessonHeader — magazine-style article header.
 *
 * Replaces the stock day badge + tag pill row with an editorial
 * masthead: kicker (phase), display-serif headline (title), deck (the
 * one-sentence objective), and byline (day · reading time · difficulty).
 */

import { Link } from 'react-router-dom'
import ReadingTime from './ReadingTime'

interface EditorialLessonHeaderProps {
  day: string
  title: string
  phaseNum: number
  phaseTitle?: string
  difficulty?: string
  difficultyColor?: string
  difficultyBg?: string
  durationMin?: number
  description?: string
  content: string
}

/**
 * Editorial header component for lesson content displaying metadata like day, title,
 * phase information, difficulty level, and estimated duration.
 *
 * @param {EditorialLessonHeaderProps} props - The component props.
 * @returns {JSX.Element} The rendered editorial lesson header.
 */
export default function EditorialLessonHeader({
  day,
  title,
  phaseNum,
  phaseTitle,
  difficulty,
  difficultyColor,
  difficultyBg,
  durationMin,
  description,
  content,
}: EditorialLessonHeaderProps) {
  return (
    <header className="lesson-masthead">
      <p className="lesson-kicker">
        <span className="kicker-dot" aria-hidden="true" />
        <Link to={`/phase/${phaseNum}`} className="lesson-kicker-link">
          Phase {String(phaseNum).padStart(2, '0')}
          {phaseTitle && <span className="lesson-kicker-divider">·</span>}
          {phaseTitle && <span className="lesson-kicker-title">{phaseTitle}</span>}
        </Link>
      </p>

      <h1 className="lesson-headline display-headline">{title}</h1>

      {description && <p className="lesson-deck">{description}</p>}

      <dl className="lesson-byline">
        <div className="byline-item">
          <dt>Day</dt>
          <dd>{String(day).padStart(2, '0')}</dd>
        </div>
        {difficulty && (
          <div className="byline-item">
            <dt>Level</dt>
            <dd
              className="byline-difficulty"
              style={
                difficultyColor || difficultyBg
                  ? { color: difficultyColor, background: difficultyBg }
                  : undefined
              }
            >
              {difficulty}
            </dd>
          </div>
        )}
        {durationMin !== undefined && (
          <div className="byline-item">
            <dt>Run time</dt>
            <dd>{durationMin}m</dd>
          </div>
        )}
        <div className="byline-item">
          <dt>Read</dt>
          <dd>
            <ReadingTime content={content} />
          </dd>
        </div>
      </dl>
    </header>
  )
}
