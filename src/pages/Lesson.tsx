/**
 * Individual lesson page component.
 *
 * This page displays a single lesson's content with full navigation, progress tracking,
 * table of contents, and related lesson recommendations. Supports keyboard shortcuts
 * for navigation between lessons.
 *
 * @module pages/Lesson
 */

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Target } from '@phosphor-icons/react'
import { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'
import SEOHead from '../components/SEOHead'
import EditorialLessonHeader from '../components/EditorialLessonHeader'
import LessonPositionBreadcrumb from '../components/LessonPositionBreadcrumb'
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

import { buildLessonSchema, buildFAQSchema } from '../utils/seoSchemas'
import { dayTokenToProgressId, parseDayToken } from '../utils/dayToken'
import {
  getLesson,
  getAdjacentLessons,
  difficultyConfig,
  getPhase,
  getCurriculumMetadata,
} from '../utils/contentLoader'
import { setLastVisited } from '../utils/progressTracker'
import MarkdownRenderer, {
  findInteractiveBlocks,
  type ParsedMasteryQuestion,
} from '../components/MarkdownRenderer'
import Breadcrumb from '../components/Breadcrumb'
import BackToTop from '../components/BackToTop'
import TableOfContents from '../components/TableOfContents'
import LessonSearch from '../components/LessonSearch'
import PrerequisitePills from '../components/PrerequisitePills'
import LessonCodeActions from '../components/LessonCodeActions'
import RelatedLessons from '../components/RelatedLessons'
import NotePanel from '../components/NotePanel'
import { toastInfo, toastSuccess } from '../utils/toast'
import { isTypingInEditableElement } from '../utils/shortcuts'
import { useProgressStore } from '../stores/progressStore'
import { useMasteryStore } from '../stores/masteryStore'
import { useUserPreferencesStore } from '../stores/userPreferencesStore'
import { completeLesson } from '../utils/completeLesson'

/**
 * Lesson page component displaying a single day's lesson.
 *
 * Features include:
 * - Full markdown content rendering with syntax highlighting
 * - Breadcrumb navigation and lesson metadata (difficulty, duration, tags)
 * - Completion tracking toggle
 * - Keyboard navigation (← previous, → next)
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
  const readingModePreference = useUserPreferencesStore((state) => state.readingMode)
  const readingComfortTheme = useUserPreferencesStore((state) => state.readingComfortTheme)
  const setReadingModePreference = useUserPreferencesStore((state) => state.setReadingMode)
  const [readingMode, setReadingMode] = useState(readingModePreference)
  const [nearBottom, setNearBottom] = useState(false)
  const articleRef = useRef<HTMLElement>(null)
  const mastheadRef = useRef<HTMLElement>(null)

  const completedLessons = useProgressStore((state) => state.completedLessons)
  const completed = dayNum ? completedLessons.includes(dayTokenToProgressId(dayNum)) : false

  // Aggregate Mastery Questions for FAQPage Schema. These hooks must run on
  // every render (including when `lesson` is missing) to satisfy the Rules
  // of Hooks, so they're placed above the `!lesson` early return below.
  const interactiveBlocks = useMemo(
    () => findInteractiveBlocks(lesson?.content ?? ''),
    [lesson?.content],
  )
  const masteryQuestions = interactiveBlocks
    .filter((block) => block.type === 'mastery')
    .map((block) => {
      const data = block.data as ParsedMasteryQuestion
      return {
        question: data.questionText,
        answer: data.answer,
      }
    })
  const masteryTotal = masteryQuestions.length
  const masteredCount = useMasteryStore((state) =>
    masteryTotal > 0 ? state.getLessonStats(lesson?.day ?? '', masteryTotal).gotIt : 0,
  )
  const reviewAgainCount = useMasteryStore((state) =>
    masteryTotal > 0 ? state.getLessonStats(lesson?.day ?? '', masteryTotal).reviewAgain : 0,
  )

  const lastToastAtRef = useRef(0)

  useEffect(() => {
    setReadingMode(readingModePreference)
  }, [readingModePreference, dayNum])
  useEffect(() => {
    let ticking = false
    const updateNearBottom = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const maxScrollable = document.documentElement.scrollHeight - window.innerHeight
          if (maxScrollable <= 0) {
            setNearBottom(true)
          } else {
            const scrollRatio = window.scrollY / maxScrollable
            setNearBottom(scrollRatio > 0.78)
          }
          ticking = false
        })
        ticking = true
      }
    }
    updateNearBottom()
    window.addEventListener('scroll', updateNearBottom, { passive: true })
    window.addEventListener('resize', updateNearBottom)
    return () => {
      window.removeEventListener('scroll', updateNearBottom)
      window.removeEventListener('resize', updateNearBottom)
    }
  }, [lesson?.day])

  const handleReadingMode = useCallback(
    (value: boolean) => {
      setReadingMode(value)
      setReadingModePreference(value)
    },
    [setReadingModePreference],
  )

  // Track last visited lesson
  useEffect(() => {
    if (lesson) {
      setLastVisited(lesson.day)
    }
  }, [lesson])

  const handleToggleComplete = useCallback(() => {
    const day = dayNum ? dayTokenToProgressId(dayNum) : Number.NaN
    const isCurrentlyComplete = useProgressStore.getState().isLessonComplete(day)

    // The mutation (and, on completion, its XP/achievement/celebration side
    // effects) always runs. `completeLesson` itself is idempotent — it only
    // fires those side effects when the lesson wasn't already complete — so
    // a rapid duplicate click can't double-award XP. Only this component's
    // own toast is suppressed for rapid duplicate clicks, via the debounce
    // check below.
    if (isCurrentlyComplete) {
      useProgressStore.getState().markLessonIncomplete(day)
    } else {
      completeLesson(day, { lesson })
    }

    const now = Date.now()
    if (now - lastToastAtRef.current < 400) {
      return
    }
    lastToastAtRef.current = now

    if (isCurrentlyComplete) {
      toastInfo('Marked as incomplete')
    } else {
      toastSuccess('Progress saved ✓')
    }
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
  const lessonDescription = `Day ${lesson.day} of Phase ${lesson.phase}: ${lesson.title}. Part of the ${getCurriculumMetadata().totalDays}-day Coding for MBA curriculum.`
  const lessonPath = `/lesson/${lesson.day}`
  const showSecondaryUi = !readingMode || nearBottom

  const jsonLdSchemas: Record<string, unknown>[] = [
    buildLessonSchema(
      lessonTitle,
      lessonDescription,
      lessonPath,
      parseDayToken(lesson.day)?.number || 0,
      lesson.phase,
    ),
  ]

  if (masteryQuestions.length > 0) {
    jsonLdSchemas.push(buildFAQSchema(masteryQuestions))
  }

  const masteryAnsweredCount = masteredCount + reviewAgainCount

  return (
    <div
      className={`page-container lesson-with-toc ${readingMode && readingComfortTheme ? 'lesson-reading-surface' : ''} ${readingMode ? 'reading-mode' : ''}`}
    >
      <SEOHead
        title={lessonTitle}
        description={lessonDescription}
        path={lessonPath}
        ogType="article"
        jsonLd={jsonLdSchemas}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: `Phase ${lesson.phase}`, url: `/phase/${lesson.phase}` },
          { name: `Day ${lesson.day}`, url: lessonPath },
        ]}
      />
      <LessonPositionBreadcrumb
        day={String(lesson.day)}
        totalDays={getCurriculumMetadata().totalDays}
        phaseNum={lesson.phase}
        mastheadRef={mastheadRef}
      />
      {/* Main content column */}
      <div className="lesson-main-content">
        {readingMode && (
          <button
            type="button"
            className="reading-mode-exit"
            onClick={() => handleReadingMode(false)}
            aria-label="Exit reading mode"
          >
            Exit reading mode
          </button>
        )}

        {readingMode && !nearBottom && masteryTotal > 0 && (
          <div
            className="mastery-mini-progress"
            role="status"
            aria-label={`${masteryAnsweredCount} of ${masteryTotal} mastery checks answered`}
          >
            <span className="mastery-mini-progress-track">
              <span
                className="mastery-mini-progress-fill"
                style={{ width: `${Math.round((masteryAnsweredCount / masteryTotal) * 100)}%` }}
              />
            </span>
            <span className="mastery-mini-progress-label">
              {masteryAnsweredCount}/{masteryTotal} mastery checks answered
            </span>
          </div>
        )}

        <div className={`lesson-header ${showSecondaryUi ? '' : 'reading-muted'}`}>
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: `Phase ${lesson.phase}`, to: `/phase/${lesson.phase}` },
              { label: `Day ${lesson.day}` },
            ]}
          />
          <EditorialLessonHeader
            ref={mastheadRef}
            day={String(lesson.day)}
            title={lesson.title}
            phaseNum={lesson.phase}
            phaseTitle={getPhase(lesson.phase)?.title}
            difficulty={diff.label}
            difficultyColor={diff.color}
            difficultyBg={diff.bg}
            durationMin={lesson.duration}
            description={typeof lesson.description === 'string' ? lesson.description : undefined}
            content={lesson.content}
          />

          {showSecondaryUi && (
            <div className="lesson-header-controls">
              <div className="lesson-controls-row">
                <button
                  type="button"
                  className={`lesson-complete-btn ${completed ? 'completed' : ''}`}
                  onClick={handleToggleComplete}
                  aria-pressed={completed}
                  aria-label={completed ? 'Mark lesson as incomplete' : 'Mark lesson as complete'}
                >
                  <span className="lesson-complete-glyph" aria-hidden="true">
                    {completed ? '✓' : '○'}
                  </span>
                  {completed ? 'Completed' : 'Mark complete'}
                </button>

                {masteryTotal > 0 && (
                  <span
                    className="mastery-progress-badge"
                    aria-label={`${masteredCount} of ${masteryTotal} mastery checks mastered`}
                  >
                    <Target aria-hidden="true" /> {masteredCount}/{masteryTotal} mastered
                  </span>
                )}
              </div>

              {lesson.tags && lesson.tags.length > 0 && (
                <div className="lesson-tags-row">
                  {lesson.tags.map((tag) => (
                    <span className="lesson-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <LessonCodeActions content={lesson.content} day={String(lesson.day)} />

              <PrerequisitePills lesson={lesson} />
            </div>
          )}
        </div>

        <LessonSearch containerRef={articleRef} />

        {/* Markdown content wrapped in semantic article tag */}
        <article ref={articleRef}>
          <MarkdownRenderer
            content={lesson.content}
            precomputedBlocks={interactiveBlocks}
            lessonId={lesson.day}
          />
        </article>

        {/* Prev/Next navigation */}
        <nav className="lesson-nav" aria-label="Lesson navigation">
          {prev && (
            <Link
              to={`/lesson/${prev.day}`}
              className="lesson-nav-btn prev"
              {...createRoutePrefetchHandlers(`/lesson/${prev.day}`)}
            >
              <span className="lesson-nav-label">← Previous</span>
              <span className="lesson-nav-title">
                Day {prev.day}: {prev.title}
              </span>
            </Link>
          )}
          {next && (
            <Link
              to={`/lesson/${next.day}`}
              className="lesson-nav-btn next"
              {...createRoutePrefetchHandlers(`/lesson/${next.day}`)}
            >
              <span className="lesson-nav-label">Next →</span>
              <span className="lesson-nav-title">
                Day {next.day}: {next.title}
              </span>
            </Link>
          )}
        </nav>

        <div className={showSecondaryUi ? '' : 'reading-muted'}>
          <NotePanel day={String(lesson.day)} />
          <RelatedLessons lesson={lesson} />
        </div>

        {!readingMode && <BackToTop />}
      </div>

      {/* Table of Contents sidebar */}
      <TableOfContents content={lesson.content} />
    </div>
  )
}
