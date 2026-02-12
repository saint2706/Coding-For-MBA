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
import { Helmet } from '@dr.pogodin/react-helmet'
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

  if (!phase) {
    return (
      <div className="page-container">
        <Helmet>
          <title>Phase Not Found — Coding for MBA</title>
        </Helmet>
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

  return (
    <div className="page-container">
      <Helmet>
        <title>
          Phase {phase.phase}: {phase.title} — Coding for MBA
        </title>
        <meta
          name="description"
          content={`Phase ${phase.phase}: ${phase.title}. ${lessons.length} lessons in the 108-day Coding for MBA curriculum.`}
        />
      </Helmet>
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
        {lessons.map((lesson) => (
          <Link to={`/lesson/${lesson.day}`} className="day-card" key={lesson.day}>
            <div className="day-card-num">{lesson.day}</div>
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
      <div style={{ marginTop: '2rem' }}>
        <MarkdownRenderer content={phase.content} />
      </div>
    </div>
  )
}
