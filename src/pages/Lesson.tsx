/**
 * Individual lesson page component.
 *
 * This page displays a single lesson's content with full navigation, progress tracking,
 * table of contents, and related lesson recommendations. Supports keyboard shortcuts
 * and swipe gestures for navigation between lessons.
 *
 * @module pages/Lesson
 */

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import SEOHead from '../components/SEOHead'
/**
 * Lesson Page
 *
 * The core learning view where users read content and complete exercises.
 *
 * Key Responsibilities:
 * - Fetch lesson content based on URL params (`/lesson/:day`).
 * - Render markdown content with interactive widgets.
 * - Track reading progress, time spent, and completion status.
 * - Handle navigation to next/previous lessons.
 * - Manage keyboard shortcuts (ArrowLeft/Right).
 */

import { buildLessonSchema } from '../utils/seoSchemas'
import { dayTokenToProgressId, parseDayToken } from '../utils/dayToken'
import {
  getLesson,
  getAdjacentLessons,
  difficultyConfig,
  getAllPhases,
  getLessonsByPhase,
} from '../utils/contentLoader'
import {
  isLessonComplete,
  toggleLessonComplete,
  setLastVisited,
  getCompletedLessons,
} from '../utils/progressTracker'
import MarkdownRenderer from '../components/MarkdownRenderer'
import Breadcrumb from '../components/Breadcrumb'
import BackToTop from '../components/BackToTop'
import TableOfContents from '../components/TableOfContents'
import ReadingTime from '../components/ReadingTime'
import PrerequisitePills from '../components/PrerequisitePills'
import RelatedLessons from '../components/RelatedLessons'
import { useSwipe } from '../hooks/useSwipe'
import { toastInfo, toastSuccess } from '../utils/toast'
import { isTypingInEditableElement } from '../utils/shortcuts'
import { useGamificationStore } from '../stores/gamificationStore'
import {
  triggerSparkle,
  triggerPhaseUnlockConfetti,
  triggerCurriculumFireworks,
} from '../utils/confetti'

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
    dayNum ? isLessonComplete(dayTokenToProgressId(dayNum)) : false,
  )
  const lastToastAtRef = useRef(0)

  // Track last visited lesson
  useEffect(() => {
    if (lesson) {
      setLastVisited(lesson.day)
    }
  }, [lesson])

  // Sync completed state when navigating between lessons
  useEffect(() => {
    setCompleted(dayNum ? isLessonComplete(dayTokenToProgressId(dayNum)) : false)
  }, [dayNum])

  const handleToggleComplete = useCallback(() => {
    const day = dayNum ? dayTokenToProgressId(dayNum) : Number.NaN
    const beforeCompleted = new Set(getCompletedLessons())
    const nowComplete = toggleLessonComplete(day)
    setCompleted(nowComplete)

    const now = Date.now()
    if (now - lastToastAtRef.current < 400) {
      return
    }

    lastToastAtRef.current = now
    if (nowComplete) {
      triggerSparkle()
      toastSuccess('Progress saved ✓')
      if (!beforeCompleted.has(day)) {
        useGamificationStore.getState().awardLessonCompletion(day)
      }

      const afterCompleted = getCompletedLessons()
      const wasPhaseCompleted = lesson
        ? getLessonsByPhase(lesson.phase).every((entry) =>
            beforeCompleted.has(dayTokenToProgressId(entry.day)),
          )
        : false
      const isPhaseCompleted = lesson
        ? getLessonsByPhase(lesson.phase).every((entry) =>
            afterCompleted.includes(dayTokenToProgressId(entry.day)),
          )
        : false

      if (lesson && !wasPhaseCompleted && isPhaseCompleted) {
        const hasNextPhase = getAllPhases().some((phase) => phase.phase === lesson.phase + 1)
        if (hasNextPhase) {
          triggerPhaseUnlockConfetti()
          toastSuccess(`Phase ${lesson.phase + 1} unlocked!`)
        }
      }

      const totalLessonCount = getAllPhases().reduce(
        (sum, phase) => sum + getLessonsByPhase(phase.phase).length,
        0,
      )
      if (afterCompleted.length === totalLessonCount) {
        triggerCurriculumFireworks()
        toastSuccess('🎓 Curriculum complete! Incredible work.')
      }
      return
    }

    toastInfo('Marked as incomplete')
  }, [dayNum, lesson])

  // Keyboard shortcuts: ← prev, → next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingInEditableElement(e.target)) return
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
        <SEOHead
          title="Lesson Not Found"
          description="The requested lesson does not exist in the Coding for MBA curriculum."
          noIndex
        />
        <h1>Lesson not found</h1>
        <p>Day {dayNum} doesn&apos;t exist in the curriculum.</p>
        <Link to="/">← Back to Home</Link>
      </div>
    )
  }

  const diff = difficultyConfig[lesson.difficulty || 'beginner'] || difficultyConfig.beginner!
  const lessonTitle = `Day ${lesson.day}: ${lesson.title}`
  const lessonDescription = `Day ${lesson.day} of Phase ${lesson.phase}: ${lesson.title}. Part of the 108-day Coding for MBA curriculum.`
  const lessonPath = `/lesson/${lesson.day}`

  return (
    <div className="page-container lesson-with-toc" ref={swipeRef}>
      <SEOHead
        title={lessonTitle}
        description={lessonDescription}
        path={lessonPath}
        ogType="article"
        jsonLd={[
          buildLessonSchema(
            lessonTitle,
            lessonDescription,
            lessonPath,
            parseDayToken(lesson.day)?.number || 0,
            lesson.phase,
          ),
        ]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: `Phase ${lesson.phase}`, url: `/phase/${lesson.phase}` },
          { name: `Day ${lesson.day}`, url: lessonPath },
        ]}
      />
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

          <motion.div className="lesson-day-badge" layoutId={`lesson-day-badge-${lesson.day}`}>
            Day {lesson.day}
          </motion.div>

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
            type="button"
            className={`lesson-complete-btn ${completed ? 'completed' : ''}`}
            onClick={handleToggleComplete}
            aria-pressed={completed}
          >
            {completed ? '✓ Completed' : '○ Mark as Complete'}
          </button>

          <PrerequisitePills lesson={lesson} />
        </div>

        {/* Markdown content wrapped in semantic article tag */}
        <article>
          <MarkdownRenderer content={lesson.content} />
        </article>

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
