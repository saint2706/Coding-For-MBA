/**
 * Theme Hook
 *
 * Custom hook for accessing the theme context.
 * Provides convenient access to current theme and toggle function.
 */

import { useContext } from 'react'
import { ThemeContext } from './ThemeContext'

/**
 * Custom hook to access the theme context.
 *
 * Must be used within a ThemeProvider component tree.
 *
 * @returns Theme context value with current theme and toggle function
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme } = useTheme()
 * return <button onClick={toggleTheme}>Current: {theme}</button>
 * ```
 */
export function useTheme() {
  return useContext(ThemeContext)
}
