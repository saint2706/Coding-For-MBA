import { useUserPreferencesStore } from '../userPreferencesStore'

const STORAGE_KEY = 'coding-for-mba-user-preferences'

describe('userPreferencesStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useUserPreferencesStore.setState({
      palette: 'gradient-blues',
      sidebarDefaultOpen: false,
      fontSize: 'md',
      codeLanguage: 'python',
      density: 'comfortable',
      readingMode: false,
      readingComfortTheme: true,
      customCursorEnabled: false,
    })
  })

  it('starts with expected defaults', () => {
    const state = useUserPreferencesStore.getState()

    expect(state.palette).toBe('gradient-blues')
    expect(state.sidebarDefaultOpen).toBe(false)
    expect(state.fontSize).toBe('md')
    expect(state.codeLanguage).toBe('python')
    expect(state.density).toBe('comfortable')
    expect(state.readingMode).toBe(false)
    expect(state.readingComfortTheme).toBe(true)
    expect(state.customCursorEnabled).toBe(false)
  })

  it('updates each preference via actions', () => {
    const store = useUserPreferencesStore.getState()

    store.setPalette('neon-party')
    store.setSidebarDefaultOpen(true)
    store.setFontSize('lg')
    store.setCodeLanguage('sql')
    store.setDensity('compact')
    store.setReadingMode(true)
    store.setReadingComfortTheme(false)
    store.setCustomCursorEnabled(true)

    const updated = useUserPreferencesStore.getState()

    expect(updated).toMatchObject({
      palette: 'neon-party',
      sidebarDefaultOpen: true,
      fontSize: 'lg',
      codeLanguage: 'sql',
      density: 'compact',
      readingMode: true,
      readingComfortTheme: false,
      customCursorEnabled: true,
    })
  })

  it('persists preferences to localStorage', () => {
    useUserPreferencesStore.getState().setPalette('pastel-dreamland')
    useUserPreferencesStore.getState().setSidebarDefaultOpen(true)

    const raw = window.localStorage.getItem(STORAGE_KEY)
    expect(raw).toBeTruthy()

    const parsed = JSON.parse(raw as string) as {
      state: { palette: string; sidebarDefaultOpen: boolean }
    }

    expect(parsed.state.palette).toBe('pastel-dreamland')
    expect(parsed.state.sidebarDefaultOpen).toBe(true)
  })

  it('normalizes invalid values from storage during migration', async () => {
    // Inject invalid state into storage with lower version to trigger migration
    const invalidState = {
      state: {
        palette: 'rainbow-unicorn', // invalid
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

    expect(state.palette).toBe('gradient-blues')
    expect(state.fontSize).toBe('md')
    expect(state.codeLanguage).toBe('python')
    expect(state.density).toBe('comfortable')
    // For boolean, it might default to false if not boolean
    expect(state.sidebarDefaultOpen).toBe(false)
    expect(state.readingComfortTheme).toBe(true)
  })

  it('migrates from legacy theme field to palette', async () => {
    const legacyState = {
      theme: 'dark',
      fontSize: 'sm',
      // Missing others
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: legacyState,
        version: 0,
      }),
    )

    await useUserPreferencesStore.persist.rehydrate()

    const state = useUserPreferencesStore.getState()
    expect(state.palette).toBe('gradient-blues')
    expect(state.fontSize).toBe('sm')
    expect(state.codeLanguage).toBe('python') // Default
  })

  it('migrates legacy light theme to light-steel palette', async () => {
    const legacyState = {
      theme: 'light',
      fontSize: 'md',
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: legacyState,
        version: 0,
      }),
    )

    await useUserPreferencesStore.persist.rehydrate()

    const state = useUserPreferencesStore.getState()
    expect(state.palette).toBe('light-steel')
  })
})
