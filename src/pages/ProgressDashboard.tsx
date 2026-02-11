import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import {
  getAllPhases,
  getLessonsByPhase,
  phaseIcons,
  difficultyConfig,
} from '../utils/contentLoader'
import {
  getCompletedLessons,
  isLessonComplete,
  getCompletedForPhase,
  clearAllProgress,
} from '../utils/progressTracker'
import ProgressBar from '../components/ProgressBar'
import Breadcrumb from '../components/Breadcrumb'

export default function ProgressDashboard() {
  const phases = getAllPhases()
  const [, setTick] = useState(0)
  const forceUpdate = useCallback(() => setTick((t) => t + 1), [])

  const completedLessons = getCompletedLessons()
  const totalLessons = phases.reduce((sum, p) => sum + getLessonsByPhase(p.phase).length, 0)
  const overallPct =
    totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0

  const handleClearProgress = () => {
    if (window.confirm('Are you sure you want to clear all progress? This cannot be undone.')) {
      clearAllProgress()
      forceUpdate()
    }
  }

  return (
    <div className="page-container">
      <Helmet>
        <title>Your Progress — Coding for MBA</title>
        <meta
          name="description"
          content="Track your progress through the 108-day Coding for MBA curriculum."
        />
      </Helmet>

      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Progress' }]} />

      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2>Your Progress</h2>
        <p>Track your journey through the 108-day curriculum.</p>
      </div>

      {/* Overall Stats */}
      <div className="progress-stats-card">
        <div className="progress-stat-big">
          <span className="progress-stat-value">{overallPct}%</span>
          <span className="progress-stat-label">Complete</span>
        </div>
        <div className="progress-stat-big">
          <span className="progress-stat-value">{completedLessons.length}</span>
          <span className="progress-stat-label">Lessons Done</span>
        </div>
        <div className="progress-stat-big">
          <span className="progress-stat-value">{totalLessons - completedLessons.length}</span>
          <span className="progress-stat-label">Remaining</span>
        </div>
      </div>

      <ProgressBar completed={completedLessons.length} total={totalLessons} />

      {/* Heatmap Grid */}
      <div className="section-header" style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>
        <h2>Lesson Heatmap</h2>
        <p>Each cell represents a lesson. Completed lessons are highlighted.</p>
      </div>

      <div className="progress-heatmap">
        {phases.map((phase) => {
          const lessons = getLessonsByPhase(phase.phase)
          const icon = phaseIcons[phase.phase - 1] || '📖'
          return (
            <div className="heatmap-phase" key={phase.phase}>
              <div className="heatmap-phase-label">
                <span>{icon}</span> P{phase.phase}
              </div>
              <div className="heatmap-cells">
                {lessons.map((lesson) => {
                  const done = isLessonComplete(lesson.day)
                  return (
                    <Link
                      to={`/lesson/${lesson.day}`}
                      className={`heatmap-cell ${done ? 'done' : ''}`}
                      key={lesson.day}
                      title={`Day ${lesson.day}: ${lesson.title}${done ? ' ✓' : ''}`}
                    >
                      <span className="sr-only">
                        Day {lesson.day}: {lesson.title} {done ? '(completed)' : '(not completed)'}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Per-Phase Progress */}
      <div className="section-header" style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>
        <h2>Progress by Phase</h2>
      </div>

      <div className="progress-phases-list">
        {phases.map((phase) => {
          const lessons = getLessonsByPhase(phase.phase)
          const lessonDays = lessons.map((l) => l.day)
          const completedInPhase = getCompletedForPhase(lessonDays)
          const icon = phaseIcons[phase.phase - 1] || '📖'
          const diff =
            difficultyConfig[phase.difficulty || 'beginner'] || difficultyConfig.beginner!

          return (
            <Link to={`/phase/${phase.phase}`} className="progress-phase-row" key={phase.phase}>
              <div className="progress-phase-info">
                <span className="progress-phase-icon">{icon}</span>
                <div>
                  <span className="progress-phase-name">
                    Phase {phase.phase}: {phase.title}
                  </span>
                  <span
                    className="difficulty-badge"
                    style={{ color: diff.color, background: diff.bg, marginLeft: '0.5rem' }}
                  >
                    {diff.label}
                  </span>
                </div>
              </div>
              <ProgressBar completed={completedInPhase.length} total={lessons.length} />
            </Link>
          )
        })}
      </div>

      {/* Clear progress */}
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <button className="progress-clear-btn" onClick={handleClearProgress}>
          Clear All Progress
        </button>
      </div>
    </div>
  )
}
