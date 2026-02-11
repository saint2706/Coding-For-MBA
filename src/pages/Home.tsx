import { Link } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import {
  getAllPhases,
  getLessonsByPhase,
  getLesson,
  difficultyConfig,
  phaseIcons,
} from '../utils/contentLoader'
import { getLastVisited, getCompletedForPhase, getCompletedCount } from '../utils/progressTracker'
import ProgressBar from '../components/ProgressBar'

export default function Home() {
  const phases = getAllPhases()
  const lastVisitedDay = getLastVisited()
  const lastVisitedLesson = lastVisitedDay ? getLesson(lastVisitedDay) : null
  const completedCount = getCompletedCount()
  const totalLessons = phases.reduce((sum, p) => sum + getLessonsByPhase(p.phase).length, 0)

  return (
    <div className="page-container">
      <Helmet>
        <title>Coding for MBA — 108-Day Technical Curriculum</title>
        <meta
          name="description"
          content="A structured 108-day curriculum covering Python, Data Science, Machine Learning, Business Intelligence, and Enterprise SQL — designed for MBA professionals."
        />
      </Helmet>
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">📚 Self-Study Curriculum</div>
        <h1>
          Master <span className="gradient-text">Technical Skills</span>
          <br />
          for Your MBA Career
        </h1>
        <p>
          A structured 108-day curriculum covering Python, Data Science, Machine Learning, Business
          Intelligence, and Enterprise SQL — designed for business professionals.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-value">108</span>
            <span className="stat-label">Days</span>
          </div>
          <div className="hero-stat">
            <span className="stat-value">9</span>
            <span className="stat-label">Phases</span>
          </div>
          <div className="hero-stat">
            <span className="stat-value">100+</span>
            <span className="stat-label">Hours</span>
          </div>
          <div className="hero-stat">
            <span className="stat-value">4</span>
            <span className="stat-label">Levels</span>
          </div>
        </div>
        <div className="hero-cta">
          <Link to="/lesson/1">Start Learning →</Link>
        </div>
        {(lastVisitedLesson || completedCount > 0) && (
          <div className="hero-continue">
            {lastVisitedLesson && (
              <Link to={`/lesson/${lastVisitedLesson.day}`}>
                ▶ Continue: Day {lastVisitedLesson.day}
              </Link>
            )}
            {completedCount > 0 && (
              <Link to="/progress">
                📊 {completedCount}/{totalLessons} Complete
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Phases Grid */}
      <section>
        <div className="section-header">
          <h2>The Learning Path</h2>
          <p>
            From Python basics to enterprise database architecture — a structured journey through 9
            phases.
          </p>
        </div>

        <div className="phases-grid">
          {phases.map((phase) => {
            const lessons = getLessonsByPhase(phase.phase)
            const diff =
              difficultyConfig[phase.difficulty || 'beginner'] || difficultyConfig.beginner!
            const icon = phaseIcons[phase.phase - 1] || '📖'
            const hours = Math.round((phase.totalDuration || 0) / 60)
            const lessonDays = lessons.map((l) => l.day)
            const completedInPhase = getCompletedForPhase(lessonDays)

            return (
              <Link to={`/phase/${phase.phase}`} className="phase-card" key={phase.phase}>
                <div className="phase-card-header">
                  <div className="phase-card-icon">{icon}</div>
                  <div className="phase-card-title">
                    <div className="phase-num">Phase {phase.phase}</div>
                    <h3>{phase.title}</h3>
                  </div>
                </div>
                <div className="phase-card-meta">
                  <span
                    className="difficulty-badge"
                    style={{ color: diff.color, background: diff.bg }}
                  >
                    {diff.label}
                  </span>
                  <span className="meta-pill">📅 {lessons.length} Days</span>
                  {hours > 0 && <span className="meta-pill">⏱ {hours}h</span>}
                </div>
                {completedInPhase.length > 0 && (
                  <div className="phase-card-progress">
                    <ProgressBar completed={completedInPhase.length} total={lessons.length} />
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
