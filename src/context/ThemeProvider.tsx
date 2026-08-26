/**
 * Theme Provider Component
 *
 * Manages the application's color palette state and CSS variable injection.
 * Synchronizes with the `UserPreferencesStore`.
 *
 * Key Responsibilities:
 * - Apply palette attributes (`data-palette`, `data-palette-type`) to the document root.
 * - Inject dynamic CSS variables for font size and density.
 * - Provide palette context to child components.
 */

import { useEffect, useMemo, type ReactNode } from 'react'
import { ColorPalette, useUserPreferencesStore } from '../stores/userPreferencesStore'
import { ThemeContext } from './ThemeContext'

// NOTE: Keep this list in sync with the dark palette definitions in variables.css.
// Any palette not listed here will be treated as a light palette.
const DARK_PALETTES: ColorPalette[] = ['terminal-dark', 'signal-rose', 'signal-cyan']

function getPaletteType(palette: ColorPalette): 'dark' | 'light' {
  return DARK_PALETTES.includes(palette) ? 'dark' : 'light'
}

/**
 * Theme Provider component.
 *
 * Wraps the application to provide theme context and injects CSS variables
 * for palette, font size, and density settings based on user preferences.
 *
 * @param props - The component props.
 * @param props.children - The child components to render.
 * @returns The theme provider element tree.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const palette = useUserPreferencesStore((state) => state.palette)
  const setPalette = useUserPreferencesStore((state) => state.setPalette)
  const fontSize = useUserPreferencesStore((state) => state.fontSize)
  const density = useUserPreferencesStore((state) => state.density)

  const paletteType = useMemo(() => getPaletteType(palette), [palette])

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette)
    document.documentElement.setAttribute('data-palette-type', paletteType)
  }, [palette, paletteType])

  useEffect(() => {
    const fontScale = fontSize === 'sm' ? '0.9375rem' : fontSize === 'lg' ? '1.0625rem' : '1rem'
    const densityScale = density === 'compact' ? '0.88' : '1'

    document.documentElement.style.setProperty('--app-font-size', fontScale)
    document.documentElement.style.setProperty('--density-scale', densityScale)
    document.documentElement.dataset.density = density
    document.documentElement.dataset.fontSize = fontSize
  }, [fontSize, density])

  return <ThemeContext.Provider value={{ palette, setPalette }}>{children}</ThemeContext.Provider>
}
