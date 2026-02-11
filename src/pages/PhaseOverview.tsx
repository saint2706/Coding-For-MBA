import { useParams, Link } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import { getPhase, getLessonsByPhase, difficultyConfig, phaseIcons } from '../utils/contentLoader'
import MarkdownRenderer from '../components/MarkdownRenderer'
import Breadcrumb from '../components/Breadcrumb'

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
        <Breadcrumb
          items={[{ label: 'Home', to: '/' }, { label: `Phase ${phase.phase}` }]}
        />
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
          </Link>
        ))}
      </div>

      {/* Phase Overview markdown content */}
      <div style={{ marginTop: '2rem' }}>
        <MarkdownRenderer content={phase.content} />
      </div>
    </div>
  )
}
