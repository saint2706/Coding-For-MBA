/**
 * Theme Context Definition
 *
 * Defines the React Context for managing application theming (light/dark mode).
 *
 * Key Responsibilities:
 * - Define the shape of the theme context (theme state, toggle function).
 * - Create the context with safe default values.
 */

import { createContext } from 'react'

/**
 * Available theme options.
 */
export type Theme = 'dark' | 'light'

/**
 * Shape of the theme context value.
 */
export interface ThemeContextType {
  /** Current active theme */
  theme: Theme
  /** Function to toggle between dark and light themes */
  toggleTheme: () => void
}

/**
 * React context for theme state management.
 * Provides default values (dark theme with no-op toggle).
 */
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
})
