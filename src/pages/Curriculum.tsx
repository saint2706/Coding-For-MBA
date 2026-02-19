/**
 * Curriculum roadmap page showing the complete 108-day learning path.
 *
 * This page displays all lessons organized by phase in a timeline format,
 * showing progress, difficulty levels, and completion status for each lesson.
 * Provides a bird's-eye view of the entire curriculum structure.
 *
 * @module pages/Curriculum
 */

import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import {
  getAllPhases,
  getLessonsByPhase,
  difficultyConfig,
  phaseIcons,
} from '../utils/contentLoader'
import { isLessonComplete, getCompletedForPhase } from '../utils/progressTracker'
import Breadcrumb from '../components/Breadcrumb'
import ProgressBar from '../components/ProgressBar'

/**
 * Curriculum roadmap page component.
 *
 * Displays the complete curriculum as a timeline organized by phases, with
 * each phase showing its lessons in chronological order. Each lesson shows
 * completion status, and phases display overall progress bars.
 *
 * @returns The rendered curriculum roadmap page
 */
export default function Curriculum() {
  const phases = getAllPhases()

  return (
    <div className="page-container">
      <SEOHead
        title="Full Curriculum Roadmap"
        description="Browse the complete 108-day curriculum roadmap across 9 phases — from Python foundations to enterprise SQL."
        path="/curriculum"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Curriculum', url: '/curriculum' },
        ]}
      />
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Curriculum' }]} />
      <div className="section-header" style={{ marginBottom: '2.5rem' }}>
        <h2>Full Curriculum Roadmap</h2>
        <p>
          108 days of structured learning across 9 phases — from Python foundations to enterprise
          SQL.
        </p>
      </div>

      <div className="curriculum-timeline">
        {phases.map((phase) => {
          const lessons = getLessonsByPhase(phase.phase)
          const diff =
            difficultyConfig[phase.difficulty || 'beginner'] || difficultyConfig.beginner!
          const icon = phaseIcons[phase.phase - 1] || '📖'

          return (
            <div className="curriculum-phase" key={phase.phase}>
              <Link to={`/phase/${phase.phase}`} className="curriculum-phase-header">
                <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                <h3>
                  Phase {phase.phase}: {phase.title}
                </h3>
                <span
                  className="difficulty-badge"
                  style={{ color: diff.color, background: diff.bg, marginLeft: 'auto' }}
                >
                  {diff.label}
                </span>
              </Link>

              <div style={{ marginBottom: '0.75rem', paddingRight: '1rem' }}>
                <ProgressBar
                  completed={getCompletedForPhase(lessons.map((l) => l.day)).length}
                  total={lessons.length}
                />
              </div>

              <div className="curriculum-days">
                {lessons.map((lesson) => (
                  <Link
                    to={`/lesson/${lesson.day}`}
                    className="curriculum-day-link"
                    key={lesson.day}
                  >
                    <span className="day-num">Day {lesson.day}</span>
                    <span>{lesson.title}</span>
                    {isLessonComplete(lesson.day) && (
                      <span className="day-link-check" aria-label="Completed">
                        ✓
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
