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
  'terminal-dark',
  'bone-light',
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

/**
 * Available color palette themes for the user interface.
 */
export type ColorPalette = z.infer<typeof ColorPaletteSchema>
/**
 * Editor font size preference.
 */
export type FontSizePreference = z.infer<typeof FontSizePreferenceSchema>

/**
 * Default programming language preference for code examples.
 */
export type CodeLanguagePreference = z.infer<typeof CodeLanguagePreferenceSchema>

/**
 * UI layout density preference.
 */
export type DensityPreference = z.infer<typeof DensityPreferenceSchema>

/**
 * Zustand store state shape for user UI preferences.
 */
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
  palette: ColorPaletteSchema.catch('terminal-dark'),
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
  return legacyTheme === 'light' ? 'bone-light' : 'terminal-dark'
}

/**
 * Hook for accessing the user preferences store state.
 *
 * @returns {UserPreferencesStore} The state of the user preferences store.
 */
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
      version: 6,
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
      migrate: (persistedState, version) => {
        const raw = (persistedState || {}) as Record<string, unknown>
        const legacyPalette =
          raw.theme === 'light'
            ? 'bone-light'
            : raw.theme === 'dark' || raw.theme === 'system'
              ? 'terminal-dark'
              : undefined

        // v5→v6: redesign migration. Anyone still on the previous default
        // (gradient-blues) gets the new default (terminal-dark). Users who
        // explicitly picked a non-default palette keep their choice.
        let palette = (raw.palette ?? legacyPalette) as ColorPalette | undefined
        if (version < 6 && palette === 'gradient-blues') {
          palette = 'terminal-dark'
        }

        const dataToParse = { ...raw, palette }

        const parsed = PersistedStateSchema.safeParse(dataToParse)
        if (parsed.success) {
          return parsed.data
        }

        return {
          palette: 'terminal-dark',
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
