/**
 * Palette Access Hook
 *
 * Provides a simplified interface for consuming the `ThemeContext`.
 *
 * Key Responsibilities:
 * - Return the current color palette and setter function.
 * - Abstract `useContext` usage.
 */

import { useContext } from 'react'
import { ThemeContext } from './ThemeContext'

/**
 * Custom hook to access the palette context.
 *
 * Must be used within a ThemeProvider component tree.
 *
 * @returns Palette context value with current palette and setter
 *
 * @example
 * ```tsx
 * const { palette, setPalette } = useTheme()
 * return <button onClick={() => setPalette('signal-rose')}>Current: {palette}</button>
 * ```
 */
export function useTheme() {
  return useContext(ThemeContext)
}
