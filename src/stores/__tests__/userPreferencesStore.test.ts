import { useUserPreferencesStore } from '../userPreferencesStore'

const STORAGE_KEY = 'coding-for-mba-user-preferences'

describe('userPreferencesStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useUserPreferencesStore.setState({
      theme: 'system',
      sidebarDefaultOpen: false,
      fontSize: 'md',
      codeLanguage: 'python',
      density: 'comfortable',
    })
  })

  it('starts with expected defaults', () => {
    const state = useUserPreferencesStore.getState()

    expect(state.theme).toBe('system')
    expect(state.sidebarDefaultOpen).toBe(false)
    expect(state.fontSize).toBe('md')
    expect(state.codeLanguage).toBe('python')
    expect(state.density).toBe('comfortable')
  })

  it('updates each preference via actions', () => {
    const store = useUserPreferencesStore.getState()

    store.setTheme('dark')
    store.setSidebarDefaultOpen(true)
    store.setFontSize('lg')
    store.setCodeLanguage('sql')
    store.setDensity('compact')

    const updated = useUserPreferencesStore.getState()

    expect(updated).toMatchObject({
      theme: 'dark',
      sidebarDefaultOpen: true,
      fontSize: 'lg',
      codeLanguage: 'sql',
      density: 'compact',
    })
  })

  it('persists preferences to localStorage', () => {
    useUserPreferencesStore.getState().setTheme('light')
    useUserPreferencesStore.getState().setSidebarDefaultOpen(true)

    const raw = window.localStorage.getItem(STORAGE_KEY)
    expect(raw).toBeTruthy()

    const parsed = JSON.parse(raw as string) as {
      state: { theme: string; sidebarDefaultOpen: boolean }
    }

    expect(parsed.state.theme).toBe('light')
    expect(parsed.state.sidebarDefaultOpen).toBe(true)
  })

  it('normalizes invalid values from storage during migration', async () => {
    // Inject invalid state into storage with lower version to trigger migration
    const invalidState = {
      state: {
        theme: 'blue', // invalid
        fontSize: 'huge', // invalid
        codeLanguage: 'ruby', // invalid
        density: 'super-dense', // invalid
        sidebarDefaultOpen: 'yes', // invalid type
      },
      version: 0, // Force migration
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidState))

    // Rehydrate
    await useUserPreferencesStore.persist.rehydrate()

    const state = useUserPreferencesStore.getState()

    expect(state.theme).toBe('system')
    expect(state.fontSize).toBe('md')
    expect(state.codeLanguage).toBe('python')
    expect(state.density).toBe('comfortable')
    // For boolean, it might default to false if not boolean
    expect(state.sidebarDefaultOpen).toBe(false)
  })

  it('migrates from legacy simple object format', async () => {
    // Suppose legacy format was just the object without version wrapper (though persist usually wraps it)
    // or if we had a migration from version 0.

    // Let's test the `migrate` function logic.
    // The store definition has `migrate`.
    // It takes persistedState.

    // If we manually set storage to something that looks like "old version"
    // But here version is 1. If we change version, migration runs?
    // No, `migrate` runs if version matches? No, `migrate` is called to migrate TO current version.

    // The `migrate` function in the store implementation:
    /*
      migrate: (persistedState) => {
        const raw = (persistedState || {}) as Record<string, unknown>
        return {
          theme: normalizeTheme(raw.theme),
          // ...
        }
      },
      */
    // It seems to handle any object.

    const legacyState = {
      theme: 'dark',
      fontSize: 'sm',
      // Missing others
    }

    // If version is mismatch, zustand calls migrate.
    // We'll simulate a saved state with lower version or no version?
    // Zustand persist defaults version to 0 if not present.
    // Our store is version 1.

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: legacyState,
        version: 0,
      }),
    )

    await useUserPreferencesStore.persist.rehydrate()

    const state = useUserPreferencesStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.fontSize).toBe('sm')
    expect(state.codeLanguage).toBe('python') // Default
  })
})
