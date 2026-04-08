/**
 * Top Navigation Bar
 *
 * The primary desktop navigation header.
 *
 * Key Responsibilities:
 * - Display brand identity and hamburger menu toggle.
 * - Provide a global search input with keyboard shortcut `/`.
 * - Show primary navigation links.
 * - Link to the external GitHub repository.
 */

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toastInfo } from '../utils/toast'
import { isTypingInEditableElement } from '../utils/shortcuts'
import { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'

interface NavbarProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

/**
 * Top Navigation Bar Component
 *
 * The primary desktop navigation header.
 *
 * @param {NavbarProps} props - The component props.
 * @param {function} props.onToggleSidebar - Function to toggle the sidebar menu.
 * @param {boolean} props.sidebarOpen - State indicating if the sidebar is open.
 * @returns {JSX.Element} The navbar element.
 */
export default function Navbar({ onToggleSidebar, sidebarOpen }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
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

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          className="navbar-hamburger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar menu"
          title="Toggle sidebar"
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
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
          <div className="brand-icon">
            <span role="img" aria-label="Graduation cap" aria-hidden="true">
              🎓
            </span>
          </div>
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
            aria-keyshortcuts="/"
          />
          {query ? (
            <button
              type="button"
              className="navbar-search-clear focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              onClick={handleClear}
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          ) : (
            <span className="navbar-search-shortcut">/</span>
          )}
        </form>
        <Link
          to="/"
          className={location.pathname === '/' ? 'active' : ''}
          aria-current={location.pathname === '/' ? 'page' : undefined}
          {...createRoutePrefetchHandlers('/')}
        >
          Home
        </Link>
        <Link
          to="/curriculum"
          className={location.pathname === '/curriculum' ? 'active' : ''}
          aria-current={location.pathname === '/curriculum' ? 'page' : undefined}
          {...createRoutePrefetchHandlers('/curriculum')}
        >
          Curriculum
        </Link>
        <Link
          to="/search"
          className={location.pathname === '/search' ? 'active' : ''}
          aria-current={location.pathname === '/search' ? 'page' : undefined}
          {...createRoutePrefetchHandlers('/search')}
        >
          Search
        </Link>
        <a
          href="https://github.com/saint2706/Coding-For-MBA"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </nav>
  )
}
