/**
 * Palette Context Definition
 *
 * Defines the React Context for managing the active color palette.
 *
 * Key Responsibilities:
 * - Define the shape of the palette context (current palette, setter).
 * - Create the context with safe default values.
 */

import { createContext } from 'react'
import { ColorPalette } from '../stores/userPreferencesStore'

/**
 * Shape of the palette context value.
 */
export interface ThemeContextType {
  /** Current active color palette */
  palette: ColorPalette
  /** Function to change the active color palette */
  setPalette: (palette: ColorPalette) => void
}

/**
 * React context for palette state management.
 * Provides default values (terminal-dark palette with no-op setter).
 */
export const ThemeContext = createContext<ThemeContextType>({
  palette: 'terminal-dark',
  setPalette: () => {},
})
