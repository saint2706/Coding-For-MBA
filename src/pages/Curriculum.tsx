import { Link } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import {
  getAllPhases,
  getLessonsByPhase,
  difficultyConfig,
  phaseIcons,
} from '../utils/contentLoader'

export default function Curriculum() {
  const phases = getAllPhases()

  return (
    <div className="page-container">
      <Helmet>
        <title>Full Curriculum Roadmap — Coding for MBA</title>
        <meta
          name="description"
          content="Browse the complete 108-day curriculum roadmap across 9 phases — from Python foundations to enterprise SQL."
        />
      </Helmet>
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

              <div className="curriculum-days">
                {lessons.map((lesson) => (
                  <Link
                    to={`/lesson/${lesson.day}`}
                    className="curriculum-day-link"
                    key={lesson.day}
                  >
                    <span className="day-num">Day {lesson.day}</span>
                    <span>{lesson.title}</span>
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
