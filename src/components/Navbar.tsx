import { Link, useLocation } from 'react-router-dom'

interface NavbarProps {
  onToggleSidebar: () => void
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="navbar-hamburger" onClick={onToggleSidebar} aria-label="Toggle menu">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">M</div>
          <span>Coding for MBA</span>
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link to="/curriculum" className={location.pathname === '/curriculum' ? 'active' : ''}>
          Curriculum
        </Link>
        <a
          href="https://github.com/saint2706/Coding-For-MBA"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
      </div>
    </nav>
  )
}
