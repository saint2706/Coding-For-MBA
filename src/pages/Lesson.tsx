import { useParams, Link } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import { getLesson, getAdjacentLessons, difficultyConfig } from '../utils/contentLoader'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function Lesson() {
  const { dayNum } = useParams<{ dayNum: string }>()
  const lesson = getLesson(dayNum!)
  const { prev, next } = getAdjacentLessons(dayNum!)

  if (!lesson) {
    return (
      <div className="page-container">
        <Helmet>
          <title>Lesson Not Found — Coding for MBA</title>
        </Helmet>
        <h1>Lesson not found</h1>
        <p>Day {dayNum} doesn&apos;t exist in the curriculum.</p>
        <Link to="/">← Back to Home</Link>
      </div>
    )
  }

  const diff = difficultyConfig[lesson.difficulty || 'beginner'] || difficultyConfig.beginner!

  return (
    <div className="page-container">
      <Helmet>
        <title>
          Day {lesson.day}: {lesson.title} — Coding for MBA
        </title>
        <meta
          name="description"
          content={`Day ${lesson.day} of Phase ${lesson.phase}: ${lesson.title}. Part of the 108-day Coding for MBA curriculum.`}
        />
      </Helmet>
      {/* Breadcrumb */}
      <div className="lesson-header">
        <div className="lesson-breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <Link to={`/phase/${lesson.phase}`}>Phase {lesson.phase}</Link>
          <span className="sep">/</span>
          <span>Day {lesson.day}</span>
        </div>

        {/* Meta bar */}
        <div className="lesson-meta-bar">
          <span className="difficulty-badge" style={{ color: diff.color, background: diff.bg }}>
            {diff.label}
          </span>
          {lesson.duration && <span className="meta-pill">⏱ {lesson.duration} min</span>}
          {lesson.tags &&
            lesson.tags.map((tag) => (
              <span className="lesson-tag" key={tag}>
                {tag}
              </span>
            ))}
        </div>
      </div>

      {/* Markdown content */}
      <MarkdownRenderer content={lesson.content} />

      {/* Prev/Next navigation */}
      <nav className="lesson-nav">
        {prev && (
          <Link to={`/lesson/${prev.day}`} className="lesson-nav-btn prev">
            <span className="lesson-nav-label">← Previous</span>
            <span className="lesson-nav-title">
              Day {prev.day}: {prev.title}
            </span>
          </Link>
        )}
        {next && (
          <Link to={`/lesson/${next.day}`} className="lesson-nav-btn next">
            <span className="lesson-nav-label">Next →</span>
            <span className="lesson-nav-title">
              Day {next.day}: {next.title}
            </span>
          </Link>
        )}
      </nav>
    </div>
  )
}
