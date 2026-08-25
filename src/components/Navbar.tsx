/**
 * Navbar — two-row status chrome.
 *
 * Row 1: StatusTicker (mono terminal-style session data).
 * Row 2: hamburger + brand + nav links + command-line search.
 *
 * The chrome is intentionally workmanlike: hairline rules instead of
 * shadows, mono everywhere, no glassmorphism. Signals "workstation".
 */

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { List } from '@phosphor-icons/react'
import { toastInfo } from '../utils/toast'
import { isTypingInEditableElement } from '../utils/shortcuts'
import { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'
import StatusTicker from './StatusTicker'

interface NavbarProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

/**
 * Top navigation bar component containing the brand logo, search functionality,
 * dark mode toggle, and mobile sidebar toggle.
 *
 * @param {NavbarProps} props - The component props.
 * @returns {JSX.Element} The rendered navigation bar.
 */
export default function Navbar({ onToggleSidebar, sidebarOpen }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const lastSearchToastAtRef = useRef(0)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (location.pathname === '/search') return
      // Lesson pages own the "/" shortcut for in-page search (see LessonSearch).
      if (location.pathname.startsWith('/lesson/')) return

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
      <StatusTicker />
      <div className="navbar-row">
        <div className="navbar-row-left">
          <button
            type="button"
            className="navbar-hamburger"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar menu"
            title="Toggle sidebar"
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
          >
            <List aria-hidden="true" />
          </button>
          <Link to="/" className="navbar-brand" {...createRoutePrefetchHandlers('/')}>
            <span className="brand-mark" aria-hidden="true">
              C/M
            </span>
            <span className="brand-wordmark">Coding for MBA</span>
          </Link>
        </div>

        <div className="navbar-row-right">
          <form onSubmit={handleSubmit} className="navbar-search-form" role="search">
            <span className="navbar-search-prompt" aria-hidden="true">
              ›
            </span>
            <input
              ref={inputRef}
              type="search"
              className="navbar-search-input"
              placeholder="search lessons, concepts, exercises…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search lessons"
              aria-keyshortcuts="/"
            />
            {query ? (
              <button
                type="button"
                className="navbar-search-clear"
                onClick={handleClear}
                aria-label="Clear search"
                title="Clear search"
              >
                ✕
              </button>
            ) : (
              <kbd className="navbar-search-shortcut">/</kbd>
            )}
          </form>
          <div className="navbar-links">
            <Link
              to="/curriculum"
              className={location.pathname === '/curriculum' ? 'active' : ''}
              aria-current={location.pathname === '/curriculum' ? 'page' : undefined}
              {...createRoutePrefetchHandlers('/curriculum')}
            >
              Curriculum
            </Link>
            <Link
              to="/notes"
              className={location.pathname === '/notes' ? 'active' : ''}
              aria-current={location.pathname === '/notes' ? 'page' : undefined}
              {...createRoutePrefetchHandlers('/notes')}
            >
              Notes
            </Link>
            <Link
              to="/progress"
              className={location.pathname === '/progress' ? 'active' : ''}
              aria-current={location.pathname === '/progress' ? 'page' : undefined}
              {...createRoutePrefetchHandlers('/progress')}
            >
              Progress
            </Link>
            <a
              href="https://github.com/saint2706/Coding-For-MBA"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-link-external"
            >
              src
              <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
