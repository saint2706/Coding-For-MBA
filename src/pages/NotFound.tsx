/**
 * 404 Not Found error page.
 *
 * This page is displayed when users navigate to a non-existent route.
 * Provides helpful navigation options including links to home, curriculum,
 * and all phases, plus keyboard shortcut hints.
 *
 * @module pages/NotFound
 */

import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import { getAllPhases, phaseIcons } from '../utils/contentLoader'
import Breadcrumb from '../components/Breadcrumb'

/**
 * 404 Not Found page component.
 *
 * Displays a user-friendly error page when a route doesn't exist, with:
 * - Clear 404 error code and message
 * - Quick action buttons to home and curriculum
 * - List of all phases as suggested alternatives
 * - Keyboard shortcut hints for search and command palette
 * - No-index meta tag to prevent search engine indexing
 *
 * @returns The rendered 404 error page
 */
export default function NotFound() {
  const phases = getAllPhases()

  return (
    <div className="page-container">
      <SEOHead
        title="Page Not Found"
        description="The page you are looking for does not exist."
        noIndex
      />
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
