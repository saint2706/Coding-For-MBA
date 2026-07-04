/**
 * Phase Overview Page
 *
 * Provides a high-level summary of a specific curriculum phase.
 *
 * Key Responsibilities:
 * - Display phase objectives and overview content.
 * - List all lessons within the phase.
 * - Show phase-specific progress.
 */

import { useParams, Link } from 'react-router-dom'
import { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import SEOHead from '../components/SEOHead'
import { getPhase, getLessonsByPhase, getNotebook, difficultyConfig } from '../utils/contentLoader'
import MarkdownRenderer from '../components/MarkdownRenderer'
import Breadcrumb from '../components/Breadcrumb'
import { useProgressStore } from '../stores/progressStore'
import { dayTokenToProgressId } from '../utils/dayToken'

/**
 * Phase overview page component.
 *
 * Displays detailed information about a specific phase including:
 * - Phase metadata (title, difficulty, duration, icon)
 * - Progress tracking across all lessons in the phase
 * - Grid of all lessons with completion indicators
 * - Link to solution notebooks if available
 * - Rendered markdown content describing the phase
 *
 * @returns The rendered phase overview page or 404 if phase not found
 */
export default function PhaseOverview() {
  const { phaseNum } = useParams<{ phaseNum: string }>()
  const phase = getPhase(phaseNum!)
  const lessons = getLessonsByPhase(phaseNum!)
  const prefersReducedMotion = useReducedMotion()

  const completedLessons = useProgressStore((state) => state.completedLessons)
  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons])

  if (!phase) {
    return (
      <div className="page-container">
        <SEOHead
          title="Phase Not Found"
          description="The requested phase does not exist in the Coding for MBA curriculum."
          noIndex
        />
        <h1>Phase not found</h1>
        <p>Phase {phaseNum} doesn&apos;t exist.</p>
        <Link to="/">← Back to Home</Link>
      </div>
    )
  }

  const diff = difficultyConfig[phase.difficulty || 'beginner'] || difficultyConfig.beginner!
  const phaseLabel = String(phase.phase).padStart(2, '0')
  const hours = Math.round((phase.totalDuration || 0) / 60)
  const notebook = getNotebook(phaseNum!)

  const completedInPhaseCount = useMemo(() => {
    let count = 0
    if (lessons) {
      for (let i = 0; i < lessons.length; i++) {
        if (completedSet.has(dayTokenToProgressId(lessons[i]!.day))) {
          count++
        }
      }
    }
    return count
  }, [lessons, completedSet])

  // Memoize lesson blocks to prevent heavy recreation of Framer Motion elements on unrelated re-renders
  const renderedLessons = useMemo(
    () =>
      lessons.map((lesson, index) => {
        const isDone = completedSet.has(dayTokenToProgressId(lesson.day))
        return (
          <motion.div
            key={lesson.day}
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.22,
              delay: prefersReducedMotion ? 0 : index * 0.025,
            }}
          >
            <Link
              to={`/lesson/${lesson.day}`}
              className={`lesson-row ${isDone ? 'lesson-row--done' : ''}`}
              {...createRoutePrefetchHandlers(`/lesson/${lesson.day}`)}
            >
              <span className="lesson-row-marker" aria-hidden="true">
                {isDone ? '✓' : String(index + 1).padStart(2, '0')}
              </span>
              <span className="lesson-row-day" aria-hidden="true">
                Day {lesson.day}
              </span>
              <span className="lesson-row-title">{lesson.title}</span>
              {lesson.duration && (
                <span className="lesson-row-duration" aria-hidden="true">
                  {lesson.duration}m
                </span>
              )}
              <span className="lesson-row-arrow" aria-hidden="true">
                →
              </span>
              {isDone && <span className="sr-only">Completed.</span>}
            </Link>
          </motion.div>
        )
      }),
    [lessons, completedSet, prefersReducedMotion],
  )

  const completedPct = Math.round((completedInPhaseCount / Math.max(1, lessons.length)) * 100)

  const phaseTitle = `Phase ${phase.phase}: ${phase.title}`
  const phaseDescription = `Phase ${phase.phase}: ${phase.title}. ${lessons.length} lessons in the 145-day Coding for MBA curriculum.`
  const phasePath = `/phase/${phase.phase}`

  return (
    <div className="page-container">
      <SEOHead
        title={phaseTitle}
        description={phaseDescription}
        path={phasePath}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: phaseTitle, url: phasePath },
        ]}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: phaseTitle,
            description: phaseDescription,
            url: `https://saint2706.github.io/Coding-For-MBA/#${phasePath}`,
            isPartOf: {
              '@type': 'Course',
              name: 'Coding for MBA — 145-Day Technical Curriculum',
            },
            numberOfItems: lessons.length,
          },
        ]}
      />
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: `Phase ${phase.phase}` }]} />

      <header className="phase-spread">
        <div className="phase-spread-numeral display-numeral" aria-hidden="true">
          {phaseLabel}
        </div>
        <div className="phase-spread-body">
          <p className="phase-spread-kicker">
            <span className="kicker-dot" aria-hidden="true" />
            Phase {phaseLabel} of {String(phase.phase).padStart(2, '0')}
          </p>
          <h1 className="phase-spread-title display-headline">{phase.title}</h1>
          <dl className="phase-spread-meta">
            <div>
              <dt>Level</dt>
              <dd
                className="phase-spread-difficulty"
                style={{ color: diff.color, background: diff.bg }}
              >
                {diff.label}
              </dd>
            </div>
            <div>
              <dt>Days</dt>
              <dd>{lessons.length}</dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>{hours > 0 ? hours : '—'}</dd>
            </div>
            <div>
              <dt>Done</dt>
              <dd>
                {completedInPhaseCount}/{lessons.length} · {completedPct}%
              </dd>
            </div>
          </dl>
          <div className="phase-spread-bar" aria-hidden="true">
            <div className="phase-spread-bar-fill" style={{ width: `${completedPct}%` }} />
          </div>
        </div>
      </header>

      <hr className="hairline-strong" />

      <section className="phase-lessons-section">
        <header className="section-masthead section-masthead--inline">
          <p className="section-eyebrow">{lessons.length} lessons</p>
          <h2 className="section-headline display-headline">The roster</h2>
        </header>
        <ol className="phase-lessons-list">{renderedLessons}</ol>
      </section>

      {notebook && notebook.cells.length > 0 && (
        <section className="phase-solutions-section">
          <header className="section-masthead section-masthead--inline">
            <p className="section-eyebrow">Solutions</p>
            <h2 className="section-headline display-headline">Notebook</h2>
            <p className="section-lede">
              Complete reference solutions with explanations — run them in your browser.
            </p>
          </header>
          <Link to={`/solutions/${phase.phase}`} className="action-secondary" {...createRoutePrefetchHandlers(`/solutions/${phase.phase}`)}>
            Open Phase {phase.phase} solutions
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}

      <article className="phase-overview-article">
        <MarkdownRenderer content={phase.content} />
      </article>
    </div>
  )
}
