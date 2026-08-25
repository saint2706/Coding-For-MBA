/**
 * MobileNav Component
 *
 * Bottom navigation bar for mobile devices with icon-based navigation
 * to main sections of the application.
 */

import { NavLink } from 'react-router-dom'
import { House, BookOpen, ChartLineUp, NotePencil } from '@phosphor-icons/react'
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
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        aria-label="Home"
        {...createRoutePrefetchHandlers('/')}
      >
        <House aria-hidden="true" />
        <span>Home</span>
      </NavLink>
      <NavLink
        to="/curriculum"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        aria-label="Learn"
        {...createRoutePrefetchHandlers('/curriculum')}
      >
        <BookOpen aria-hidden="true" />
        <span>Learn</span>
      </NavLink>
      <NavLink
        to="/progress"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        aria-label="Progress"
        {...createRoutePrefetchHandlers('/progress')}
      >
        <ChartLineUp aria-hidden="true" />
        <span>Progress</span>
      </NavLink>
      <NavLink
        to="/notes"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        aria-label="Notes"
        {...createRoutePrefetchHandlers('/notes')}
      >
        <NotePencil aria-hidden="true" />
        <span>Notes</span>
      </NavLink>
    </nav>
  )
}
