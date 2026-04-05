/**
 * MobileNav Component
 *
 * Bottom navigation bar for mobile devices with icon-based navigation
 * to main sections of the application.
 */

import { NavLink, useLocation } from 'react-router-dom'
import { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'

/**
 * Mobile Navigation Bar
 *
 * Fixed bottom navigation bar for mobile devices.
 *
 * Key Responsibilities:
 * - Provide quick access to primary app sections (Home, Learn, Progress, Explore).
 * - Highlight active route state.
 * - Hide on desktop viewports via CSS media queries.
 *
 * @returns {JSX.Element} The rendered mobile navigation bar.
 */
export default function MobileNav() {
  const location = useLocation()
  const isLesson = location.pathname.startsWith('/lesson/')

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        aria-label="Home"
        {...createRoutePrefetchHandlers('/')}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <span>Home</span>
      </NavLink>
      <NavLink
        to="/curriculum"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        aria-label="Learn"
        {...createRoutePrefetchHandlers('/curriculum')}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
        <span>Learn</span>
      </NavLink>
      <NavLink
        to="/progress"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        aria-label="Progress"
        {...createRoutePrefetchHandlers('/progress')}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <span>Progress</span>
      </NavLink>
      <NavLink
        to="/concepts"
        className={({ isActive }) => `mobile-nav-item ${isActive || isLesson ? 'active' : ''}`}
        aria-label="Explore"
        {...createRoutePrefetchHandlers('/concepts')}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4m0 12v4m-7.07-2.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-2.93 7.07l-2.83-2.83M6.76 6.76L3.93 3.93" />
        </svg>
        <span>Explore</span>
      </NavLink>
    </nav>
  )
}
