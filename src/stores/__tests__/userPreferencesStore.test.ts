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
})
