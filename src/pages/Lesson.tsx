/**
 * Individual lesson page component.
 *
 * This page displays a single lesson's content with full navigation, progress tracking,
 * table of contents, and related lesson recommendations. Supports keyboard shortcuts
 * and swipe gestures for navigation between lessons.
 *
 * @module pages/Lesson
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import { getLesson, getAdjacentLessons, difficultyConfig } from '../utils/contentLoader'
import { isLessonComplete, toggleLessonComplete, setLastVisited } from '../utils/progressTracker'
import MarkdownRenderer from '../components/MarkdownRenderer'
import Breadcrumb from '../components/Breadcrumb'
import BackToTop from '../components/BackToTop'
import TableOfContents from '../components/TableOfContents'
import ReadingTime from '../components/ReadingTime'
import PrerequisitePills from '../components/PrerequisitePills'
import RelatedLessons from '../components/RelatedLessons'
import { useSwipe } from '../hooks/useSwipe'

/**
 * Lesson page component displaying a single day's lesson.
 *
 * Features include:
 * - Full markdown content rendering with syntax highlighting
 * - Breadcrumb navigation and lesson metadata (difficulty, duration, tags)
 * - Completion tracking toggle
 * - Keyboard navigation (← previous, → next)
 * - Swipe gestures for mobile navigation
 * - Table of contents sidebar
 * - Prerequisite and related lesson recommendations
 * - Previous/next lesson navigation buttons
 *
 * @returns The rendered lesson page or 404 if lesson not found
 */
export default function Lesson() {
  const { dayNum } = useParams<{ dayNum: string }>()
  const navigate = useNavigate()
  const lesson = getLesson(dayNum!)
  const { prev, next } = getAdjacentLessons(dayNum!)
  const [completed, setCompleted] = useState(() =>
    dayNum ? isLessonComplete(Number(dayNum)) : false,
  )

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

  // Swipe gestures for mobile prev/next
  const handleSwipeLeft = useMemo(
    () => (next ? () => navigate(`/lesson/${next.day}`) : undefined),
    [next, navigate],
  )
  const handleSwipeRight = useMemo(
    () => (prev ? () => navigate(`/lesson/${prev.day}`) : undefined),
    [prev, navigate],
  )
  const swipeRef = useSwipe({ onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight })

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
    <div className="page-container lesson-with-toc" ref={swipeRef}>
      <Helmet>
        <title>
          Day {lesson.day}: {lesson.title} — Coding for MBA
        </title>
        <meta
          name="description"
          content={`Day ${lesson.day} of Phase ${lesson.phase}: ${lesson.title}. Part of the 108-day Coding for MBA curriculum.`}
        />
      </Helmet>
      {/* Main content column */}
      <div className="lesson-main-content">
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
            <ReadingTime content={lesson.content} />
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

          <PrerequisitePills lesson={lesson} />
        </div>

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

        <RelatedLessons lesson={lesson} />

        <BackToTop />
      </div>

      {/* Table of Contents sidebar */}
      <TableOfContents content={lesson.content} />
    </div>
  )
}
