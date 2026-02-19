import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/useTheme'
import SearchPalette from './SearchPalette'
import { toastInfo } from '../utils/toast'

interface NavbarProps {
  onToggleSidebar: () => void
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [query, setQuery] = useState('')
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const openSearchPalette = () => {
    setIsPaletteOpen(true)
    toastInfo('Search opened — press ESC to close', { duration: 2000 })
  }

  const closeSearchPalette = () => {
    setIsPaletteOpen(false)
    toastInfo('Search closed', { duration: 1200 })
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isTypingTarget = (target: EventTarget | null) => {
        const element = target as HTMLElement | null
        return (
          element?.tagName === 'INPUT' ||
          element?.tagName === 'TEXTAREA' ||
          element?.isContentEditable
        )
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        if (isTypingTarget(event.target)) return

        event.preventDefault()
        if (!isPaletteOpen) {
          openSearchPalette()
        }
        return
      }

      // Skip navbar slash shortcut while palette is open or on /search page to avoid conflict
      if (isPaletteOpen || location.pathname === '/search') return

      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (isTypingTarget(event.target)) return

        event.preventDefault()
        inputRef.current?.focus()
      }

      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        event.preventDefault()
        setQuery('')
        navigate('/search')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isPaletteOpen, navigate, location.pathname])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="navbar-hamburger"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
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
        <button
          type="button"
          className="theme-toggle"
          onClick={openSearchPalette}
          aria-label="Open command palette search"
          title="Open command palette search (Ctrl/Cmd+K)"
        >
          🔎
        </button>
        <form onSubmit={handleSubmit} className="navbar-search-form">
          <input
            ref={inputRef}
            type="search"
            className="navbar-search-input"
            placeholder="Search…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search lessons"
          />
          <span className="navbar-search-shortcut">/</span>
        </form>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link to="/curriculum" className={location.pathname === '/curriculum' ? 'active' : ''}>
          Curriculum
        </Link>
        <Link to="/search" className={location.pathname === '/search' ? 'active' : ''}>
          Search
        </Link>
        <a
          href="https://github.com/saint2706/Coding-For-MBA"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
      </div>
      <SearchPalette isOpen={isPaletteOpen} onClose={closeSearchPalette} />
    </nav>
  )
}
