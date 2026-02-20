/**
 * Theme Access Hook
 *
 * Provides a simplified interface for consuming the `ThemeContext`.
 *
 * Key Responsibilities:
 * - Return the current theme and toggle function.
 * - Abstract `useContext` usage.
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
