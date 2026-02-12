/**
 * Theme Provider Component
 * 
 * Manages theme state and persistence for the application.
 * Supports localStorage persistence and system preference detection.
 */

import { useState, useEffect, useCallback, ReactNode } from 'react'
import { Theme, ThemeContext } from './ThemeContext'

/**
 * Determines the initial theme based on localStorage and system preferences.
 * 
 * Priority order:
 * 1. Value from localStorage (if valid)
 * 2. System prefers-color-scheme media query
 * 3. Default to 'dark'
 * 
 * @returns The initial theme to use
 */
function getInitialTheme(): Theme {
  // Check localStorage first
  const stored = localStorage.getItem('theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored

  // Respect prefers-color-scheme
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'

  return 'dark'
}

/**
 * ThemeProvider component that manages and persists theme state.
 * 
 * Provides theme context to child components with automatic persistence
 * to localStorage and dynamic updates based on system preferences.
 * Applies theme to document root via data-theme attribute.
 * 
 * @param props - Component props
 * @param props.children - Child components that will have access to theme context
 * @returns Provider component wrapping children
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = (e: MediaQueryListEvent) => {
      // Only auto-switch if no explicit preference stored
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'light' : 'dark')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
