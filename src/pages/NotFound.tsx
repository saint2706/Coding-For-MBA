import { Link } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import { getAllPhases, phaseIcons } from '../utils/contentLoader'
import Breadcrumb from '../components/Breadcrumb'

export default function NotFound() {
  const phases = getAllPhases()

  return (
    <div className="page-container">
      <Helmet>
        <title>Page Not Found — Coding for MBA</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: '404' }]} />
      <div className="not-found">
        <h1 className="not-found-code">404</h1>
        <p className="not-found-message">The page you&apos;re looking for doesn&apos;t exist.</p>
        <div className="not-found-actions">
          <Link to="/" className="hero-cta-link">
            ← Back to Home
          </Link>
          <Link to="/curriculum" className="hero-cta-link">
            Browse Curriculum
          </Link>
        </div>
        <div className="not-found-suggestions">
          <h2>Quick Links</h2>
          <div className="not-found-phases">
            {phases.map((phase) => {
              const icon = phaseIcons[phase.phase - 1] || '📖'
              return (
                <Link
                  to={`/phase/${phase.phase}`}
                  className="not-found-phase-link"
                  key={phase.phase}
                >
                  <span>{icon}</span>
                  <span>
                    Phase {phase.phase}: {phase.title}
                  </span>
                </Link>
              )
            })}
          </div>
          <p className="not-found-tip">
            💡 Tip: Press <kbd>/</kbd> to search or <kbd>⌘K</kbd> to open the command palette.
          </p>
        </div>
      </div>
    </div>
  )
}
