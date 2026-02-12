/**
 * Theme Context
 * 
 * Defines the React context for theme management (dark/light mode).
 * Provides shared theme state and toggle functionality across the application.
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
