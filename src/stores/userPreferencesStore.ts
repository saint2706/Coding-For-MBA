/**
 * User Preferences Store
 *
 * Manages global user settings and UI customization.
 *
 * Key Responsibilities:
 * - Store theme preferences (light/dark/system).
 * - Manage editor font size and density settings.
 * - Set default code languages (Python vs SQL).
 * - Persist settings to localStorage.
 */

import { create } from 'zustand'
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware'
import { getStoredString } from '../utils/safeStorage'

export type ThemePreference = 'light' | 'dark' | 'system'
export type FontSizePreference = 'sm' | 'md' | 'lg'
export type CodeLanguagePreference = 'python' | 'sql'
export type DensityPreference = 'comfortable' | 'compact'

export type UserPreferencesStore = {
  theme: ThemePreference
  sidebarDefaultOpen: boolean
  fontSize: FontSizePreference
  codeLanguage: CodeLanguagePreference
  density: DensityPreference
  readingMode: boolean
  customCursorEnabled: boolean
  setTheme: (theme: ThemePreference) => void
  setSidebarDefaultOpen: (open: boolean) => void
  setFontSize: (size: FontSizePreference) => void
  setCodeLanguage: (language: CodeLanguagePreference) => void
  setDensity: (density: DensityPreference) => void
  setReadingMode: (readingMode: boolean) => void
  setCustomCursorEnabled: (customCursorEnabled: boolean) => void
}

const STORAGE_KEY = 'coding-for-mba-user-preferences'
const LEGACY_THEME_KEY = 'theme'

const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(name, value)
    } catch {
      // Ignore localStorage write failures.
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(name)
    } catch {
      // Ignore localStorage delete failures.
    }
  },
}

function normalizeTheme(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system'
}

function normalizeFontSize(value: unknown): FontSizePreference {
  return value === 'sm' || value === 'md' || value === 'lg' ? value : 'md'
}

function normalizeCodeLanguage(value: unknown): CodeLanguagePreference {
  return value === 'python' || value === 'sql' ? value : 'python'
}

function normalizeDensity(value: unknown): DensityPreference {
  return value === 'comfortable' || value === 'compact' ? value : 'comfortable'
}

function getLegacyThemePreference(): ThemePreference {
  const legacyTheme = getStoredString(LEGACY_THEME_KEY)
  return legacyTheme === 'light' || legacyTheme === 'dark' ? legacyTheme : 'system'
}

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (set) => ({
      theme: getLegacyThemePreference(),
      sidebarDefaultOpen: false,
      fontSize: 'md',
      codeLanguage: 'python',
      density: 'comfortable',
      readingMode: false,
      customCursorEnabled: false,
      setTheme: (theme) => set({ theme }),
      setSidebarDefaultOpen: (sidebarDefaultOpen) => set({ sidebarDefaultOpen }),
      setFontSize: (fontSize) => set({ fontSize }),
      setCodeLanguage: (codeLanguage) => set({ codeLanguage }),
      setDensity: (density) => set({ density }),
      setReadingMode: (readingMode) => set({ readingMode }),
      setCustomCursorEnabled: (customCursorEnabled) => set({ customCursorEnabled }),
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarDefaultOpen: state.sidebarDefaultOpen,
        fontSize: state.fontSize,
        codeLanguage: state.codeLanguage,
        density: state.density,
        readingMode: state.readingMode,
        customCursorEnabled: state.customCursorEnabled,
      }),
      migrate: (persistedState) => {
        const raw = (persistedState || {}) as Record<string, unknown>
        return {
          theme: normalizeTheme(raw.theme),
          sidebarDefaultOpen:
            typeof raw.sidebarDefaultOpen === 'boolean' ? raw.sidebarDefaultOpen : false,
          fontSize: normalizeFontSize(raw.fontSize),
          codeLanguage: normalizeCodeLanguage(raw.codeLanguage),
          density: normalizeDensity(raw.density),
          readingMode: typeof raw.readingMode === 'boolean' ? raw.readingMode : false,
          customCursorEnabled:
            typeof raw.customCursorEnabled === 'boolean' ? raw.customCursorEnabled : false,
        }
      },
    },
  ),
)

export const selectThemePreference = (state: UserPreferencesStore) => state.theme
export const selectSidebarDefaultOpen = (state: UserPreferencesStore) => state.sidebarDefaultOpen
export const selectReadingMode = (state: UserPreferencesStore) => state.readingMode
