/**
 * Phase overview page displaying detailed information about a specific phase.
 *
 * This page shows comprehensive information for a single phase including
 * its lessons, difficulty level, estimated time, progress tracking, and
 * access to solution notebooks. The phase content is rendered from markdown.
 *
 * @module pages/PhaseOverview
 */

import { useParams, Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import SEOHead from '../components/SEOHead'
import {
  getPhase,
  getLessonsByPhase,
  getNotebook,
  difficultyConfig,
  phaseIcons,
} from '../utils/contentLoader'
import { isLessonComplete, getCompletedForPhase } from '../utils/progressTracker'
import MarkdownRenderer from '../components/MarkdownRenderer'
import Breadcrumb from '../components/Breadcrumb'
import ProgressBar from '../components/ProgressBar'

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
  const icon = phaseIcons[phase.phase - 1] || '📖'
  const hours = Math.round((phase.totalDuration || 0) / 60)
  const lessonDays = lessons.map((l) => l.day)
  const completedInPhase = getCompletedForPhase(lessonDays)
  const notebook = getNotebook(phaseNum!)

  const phaseTitle = `Phase ${phase.phase}: ${phase.title}`
  const phaseDescription = `Phase ${phase.phase}: ${phase.title}. ${lessons.length} lessons in the 108-day Coding for MBA curriculum.`
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
              name: 'Coding for MBA — 108-Day Technical Curriculum',
            },
            numberOfItems: lessons.length,
          },
        ]}
      />
      {/* Phase Header */}
      <div className="phase-header">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: `Phase ${phase.phase}` }]} />
        <div className="phase-header-top">
          <div className="phase-header-icon">{icon}</div>
          <div>
            <h1>
              Phase {phase.phase}: {phase.title}
            </h1>
            <div className="lesson-meta-bar" style={{ marginTop: '0.75rem' }}>
              <span className="difficulty-badge" style={{ color: diff.color, background: diff.bg }}>
                {diff.label}
              </span>
              <span className="meta-pill">📅 {lessons.length} Days</span>
              {hours > 0 && <span className="meta-pill">⏱ {hours} hours</span>}
            </div>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <ProgressBar completed={completedInPhase.length} total={lessons.length} />
        </div>
      </div>

      {/* Day Lessons Grid */}
      <div className="section-header">
        <h2>Lessons in This Phase</h2>
      </div>
      <div className="phase-lessons-grid">
        {lessons.map((lesson, index) => (
          <motion.div
            key={lesson.day}
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.26,
              delay: prefersReducedMotion ? 0 : index * 0.03,
            }}
          >
            <Link to={`/lesson/${lesson.day}`} className="day-card">
              <motion.div className="day-card-num" layoutId={`lesson-day-badge-${lesson.day}`}>
                {lesson.day}
              </motion.div>
              <div className="day-card-info">
                <h4>{lesson.title}</h4>
                {lesson.duration && <span>⏱ {lesson.duration} min</span>}
              </div>
              {isLessonComplete(lesson.day) && (
                <span className="day-link-check" aria-label="Completed">
                  ✓
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Solution Notebook Link */}
      {notebook && notebook.cells.length > 0 && (
        <div className="section-header" style={{ marginTop: '2rem' }}>
          <h2>📓 Solutions Notebook</h2>
          <p>Complete solutions with explanations — run them in your browser.</p>
          <Link
            to={`/solutions/${phase.phase}`}
            className="exercises-notebook-link"
            style={{
              marginTop: '0.75rem',
              display: 'inline-flex',
              fontSize: '0.875rem',
              padding: '0.5rem 1rem',
            }}
          >
            {icon} View Phase {phase.phase} Solutions →
          </Link>
        </div>
      )}

      {/* Phase Overview markdown content */}
      <article style={{ marginTop: '2rem' }}>
        <MarkdownRenderer content={phase.content} />
      </article>
    </div>
  )
}
