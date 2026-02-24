/**
 * Top Navigation Bar
 *
 * The primary desktop navigation header.
 *
 * Key Responsibilities:
 * - Display brand identity and hamburger menu toggle.
 * - Provide a global search input with keyboard shortcut `/`.
 * - Show primary navigation links and theme toggle.
 * - Link to the external GitHub repository.
 */

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/useTheme'
import { toastInfo } from '../utils/toast'
import { isTypingInEditableElement } from '../utils/shortcuts'
import { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'

interface NavbarProps {
  onToggleSidebar: () => void
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const lastSearchToastAtRef = useRef(0)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Skip navbar shortcut when on /search page to avoid conflict
      if (location.pathname === '/search') return

      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (isTypingInEditableElement(event.target)) return

        event.preventDefault()
        inputRef.current?.focus()

        const now = Date.now()
        if (now - lastSearchToastAtRef.current > 800) {
          toastInfo('Search opened. Type a query and press Enter. Press Esc to close.')
          lastSearchToastAtRef.current = now
        }
      }

      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        event.preventDefault()
        setQuery('')
        navigate('/search')
        toastInfo('Search closed. Press / to reopen quickly.')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, location.pathname])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    toggleTheme()
    toastInfo(`Switched to ${nextTheme} mode`)
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
        <Link to="/" className="navbar-brand" {...createRoutePrefetchHandlers('/')}>
          <div className="brand-icon">M</div>
          <span>Coding for MBA</span>
        </Link>
      </div>

      <div className="navbar-links">
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
          onClick={handleThemeToggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="20"
              height="20"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="20"
              height="20"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <Link
          to="/"
          className={location.pathname === '/' ? 'active' : ''}
          {...createRoutePrefetchHandlers('/')}
        >
          Home
        </Link>
        <Link
          to="/curriculum"
          className={location.pathname === '/curriculum' ? 'active' : ''}
          {...createRoutePrefetchHandlers('/curriculum')}
        >
          Curriculum
        </Link>
        <Link
          to="/search"
          className={location.pathname === '/search' ? 'active' : ''}
          {...createRoutePrefetchHandlers('/search')}
        >
          Search
        </Link>
        <a
          href="https://github.com/saint2706/Coding-For-MBA"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </nav>
  )
}
