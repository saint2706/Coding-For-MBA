/**
 * Theme Provider Component
 *
 * Manages the application's visual theme state and CSS variable injection.
 * Synchronizes with the `UserPreferencesStore` and system color scheme.
 *
 * Key Responsibilities:
 * - Listen for system "prefers-color-scheme" changes.
 * - Apply theme attributes (`data-theme`) to the document root.
 * - Inject dynamic CSS variables for font size and density.
 * - Provide theme context to child components.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Theme, ThemeContext } from './ThemeContext'
import { useUserPreferencesStore } from '../stores/userPreferencesStore'

function resolveTheme(themePreference: 'light' | 'dark' | 'system', prefersDark: boolean): Theme {
  if (themePreference === 'system') {
    return prefersDark ? 'dark' : 'light'
  }
  return themePreference
}

function getInitialSystemDarkMode(): boolean {
  const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
  return mediaQuery?.matches ?? false
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themePreference = useUserPreferencesStore((state) => state.theme)
  const setThemePreference = useUserPreferencesStore((state) => state.setTheme)
  const fontSize = useUserPreferencesStore((state) => state.fontSize)
  const density = useUserPreferencesStore((state) => state.density)
  const [prefersDark, setPrefersDark] = useState(getInitialSystemDarkMode)

  const resolvedTheme = useMemo(
    () => resolveTheme(themePreference, prefersDark),
    [themePreference, prefersDark],
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mediaQuery) return

    const listener = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches)
    }

    setPrefersDark(mediaQuery.matches)
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    document.documentElement.dataset.themePreference = themePreference
  }, [resolvedTheme, themePreference])

  useEffect(() => {
    const fontScale = fontSize === 'sm' ? '0.9375rem' : fontSize === 'lg' ? '1.0625rem' : '1rem'
    const densityScale = density === 'compact' ? '0.88' : '1'

    document.documentElement.style.setProperty('--app-font-size', fontScale)
    document.documentElement.style.setProperty('--density-scale', densityScale)
    document.documentElement.dataset.density = density
    document.documentElement.dataset.fontSize = fontSize
  }, [fontSize, density])

  const toggleTheme = () => {
    setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
