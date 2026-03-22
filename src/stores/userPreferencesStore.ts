/**
 * User Preferences Store
 *
 * Manages global user settings and UI customization.
 *
 * Key Responsibilities:
 * - Store color palette preference.
 * - Manage editor font size and density settings.
 * - Set default code languages (Python vs SQL).
 * - Persist settings to localStorage.
 */

import { create } from 'zustand'
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware'
import { z } from 'zod'
import { getStoredString } from '../utils/safeStorage'

const ColorPaletteSchema = z.enum([
  'peach-sorbet',
  'gradient-blues',
  'neon-party',
  'deep-ocean-blue',
  'pastel-dreamland',
  'golden-summer-fields',
  'light-steel',
])

const FontSizePreferenceSchema = z.enum(['sm', 'md', 'lg'])
const CodeLanguagePreferenceSchema = z.enum(['python', 'sql'])
const DensityPreferenceSchema = z.enum(['comfortable', 'compact'])

export type ColorPalette = z.infer<typeof ColorPaletteSchema>
export type FontSizePreference = z.infer<typeof FontSizePreferenceSchema>
export type CodeLanguagePreference = z.infer<typeof CodeLanguagePreferenceSchema>
export type DensityPreference = z.infer<typeof DensityPreferenceSchema>

export type UserPreferencesStore = {
  palette: ColorPalette
  sidebarDefaultOpen: boolean
  fontSize: FontSizePreference
  codeLanguage: CodeLanguagePreference
  density: DensityPreference
  readingMode: boolean
  readingComfortTheme: boolean
  customCursorEnabled: boolean
  setPalette: (palette: ColorPalette) => void
  setSidebarDefaultOpen: (open: boolean) => void
  setFontSize: (size: FontSizePreference) => void
  setCodeLanguage: (language: CodeLanguagePreference) => void
  setDensity: (density: DensityPreference) => void
  setReadingMode: (readingMode: boolean) => void
  setReadingComfortTheme: (readingComfortTheme: boolean) => void
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

const PersistedStateSchema = z.object({
  palette: ColorPaletteSchema.catch('gradient-blues'),
  sidebarDefaultOpen: z.boolean().catch(false),
  fontSize: FontSizePreferenceSchema.catch('md'),
  codeLanguage: CodeLanguagePreferenceSchema.catch('python'),
  density: DensityPreferenceSchema.catch('comfortable'),
  readingMode: z.boolean().catch(false),
  readingComfortTheme: z.boolean().catch(true),
  customCursorEnabled: z.boolean().catch(false),
})

function getLegacyPalette(): ColorPalette {
  const legacyTheme = getStoredString(LEGACY_THEME_KEY)
  // Map legacy dark/system → gradient-blues, light → light-steel
  return legacyTheme === 'light' ? 'light-steel' : 'gradient-blues'
}

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (set) => ({
      palette: getLegacyPalette(),
      sidebarDefaultOpen: false,
      fontSize: 'md',
      codeLanguage: 'python',
      density: 'comfortable',
      readingMode: false,
      readingComfortTheme: true,
      customCursorEnabled: false,
      setPalette: (palette) => set({ palette }),
      setSidebarDefaultOpen: (sidebarDefaultOpen) => set({ sidebarDefaultOpen }),
      setFontSize: (fontSize) => set({ fontSize }),
      setCodeLanguage: (codeLanguage) => set({ codeLanguage }),
      setDensity: (density) => set({ density }),
      setReadingMode: (readingMode) => set({ readingMode }),
      setReadingComfortTheme: (readingComfortTheme) => set({ readingComfortTheme }),
      setCustomCursorEnabled: (customCursorEnabled) => set({ customCursorEnabled }),
    }),
    {
      name: STORAGE_KEY,
      version: 5,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        palette: state.palette,
        sidebarDefaultOpen: state.sidebarDefaultOpen,
        fontSize: state.fontSize,
        codeLanguage: state.codeLanguage,
        density: state.density,
        readingMode: state.readingMode,
        readingComfortTheme: state.readingComfortTheme,
        customCursorEnabled: state.customCursorEnabled,
      }),
      migrate: (persistedState) => {
        const raw = (persistedState || {}) as Record<string, unknown>
        // Migrate legacy `theme` field to `palette`
        const legacyPalette =
          raw.theme === 'light'
            ? 'light-steel'
            : raw.theme === 'dark' || raw.theme === 'system'
              ? 'gradient-blues'
              : undefined

        const dataToParse = {
          ...raw,
          palette: raw.palette ?? legacyPalette,
        }

        const parsed = PersistedStateSchema.safeParse(dataToParse)
        if (parsed.success) {
          return parsed.data
        }

        // Fallback if parsing completely fails (e.g. data is not an object)
        return {
          palette: 'gradient-blues',
          sidebarDefaultOpen: false,
          fontSize: 'md',
          codeLanguage: 'python',
          density: 'comfortable',
          readingMode: false,
          readingComfortTheme: true,
          customCursorEnabled: false,
        }
      },
    },
  ),
)

/**
 * Selector for the palette preference.
 * @param {UserPreferencesStore} state - The user preferences state.
 * @returns {string} The selected palette.
 */
export const selectPalette = (state: UserPreferencesStore) => state.palette
/**
 * Selector for the sidebar default open preference.
 * @param {UserPreferencesStore} state - The user preferences state.
 * @returns {boolean} Whether the sidebar is default open.
 */
export const selectSidebarDefaultOpen = (state: UserPreferencesStore) => state.sidebarDefaultOpen
/**
 * Selector for the reading mode preference.
 * @param {UserPreferencesStore} state - The user preferences state.
 * @returns {boolean} Whether reading mode is enabled.
 */
export const selectReadingMode = (state: UserPreferencesStore) => state.readingMode
/**
 * Selector for the reading comfort theme preference.
 * @param {UserPreferencesStore} state - The user preferences state.
 * @returns {boolean} Whether the reading comfort theme is enabled.
 */
export const selectReadingComfortTheme = (state: UserPreferencesStore) => state.readingComfortTheme
