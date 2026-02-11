import { Link } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'

export default function NotFound() {
  return (
    <div className="page-container">
      <Helmet>
        <title>Page Not Found — Coding for MBA</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="hero-cta-link">
            ← Back to Home
          </Link>
          <Link to="/curriculum" className="hero-cta-link">
            Browse Curriculum
          </Link>
        </div>
      </div>
    </div>
  )
}
