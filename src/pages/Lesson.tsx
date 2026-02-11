import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import { getLesson, getAdjacentLessons, difficultyConfig } from '../utils/contentLoader'
import { isLessonComplete, toggleLessonComplete, setLastVisited } from '../utils/progressTracker'
import MarkdownRenderer from '../components/MarkdownRenderer'
import Breadcrumb from '../components/Breadcrumb'
import BackToTop from '../components/BackToTop'
import TableOfContents from '../components/TableOfContents'

export default function Lesson() {
  const { dayNum } = useParams<{ dayNum: string }>()
  const navigate = useNavigate()
  const lesson = getLesson(dayNum!)
  const { prev, next } = getAdjacentLessons(dayNum!)
  const [completed, setCompleted] = useState(() => isLessonComplete(Number(dayNum)))

  // Track last visited lesson
  useEffect(() => {
    if (lesson) {
      setLastVisited(lesson.day)
    }
  }, [lesson])

  // Sync completed state when navigating between lessons
  useEffect(() => {
    setCompleted(isLessonComplete(Number(dayNum)))
  }, [dayNum])

  const handleToggleComplete = useCallback(() => {
    const nowComplete = toggleLessonComplete(Number(dayNum))
    setCompleted(nowComplete)
  }, [dayNum])

  // Keyboard shortcuts: ← prev, → next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
        return
      if (e.key === 'ArrowLeft' && prev) {
        navigate(`/lesson/${prev.day}`)
      } else if (e.key === 'ArrowRight' && next) {
        navigate(`/lesson/${next.day}`)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [prev, next, navigate])

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
    <div className="page-container lesson-with-toc">
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
        <Breadcrumb
          items={[
            { label: 'Home', to: '/' },
            { label: `Phase ${lesson.phase}`, to: `/phase/${lesson.phase}` },
            { label: `Day ${lesson.day}` },
          ]}
        />

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

        <button
          className={`lesson-complete-btn ${completed ? 'completed' : ''}`}
          onClick={handleToggleComplete}
          aria-pressed={completed}
        >
          {completed ? '✓ Completed' : '○ Mark as Complete'}
        </button>
      </div>

      {/* Table of Contents sidebar */}
      <TableOfContents content={lesson.content} />

      {/* Markdown content */}
      <MarkdownRenderer content={lesson.content} />

      {/* Prev/Next navigation */}
      <nav className="lesson-nav" aria-label="Lesson navigation">
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

      <BackToTop />
    </div>
  )
}
