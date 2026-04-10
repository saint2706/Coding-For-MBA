import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ThemeProvider } from '../ThemeProvider'
import * as userPreferencesStore from '../../stores/userPreferencesStore'
import { ThemeContext } from '../ThemeContext'

// Mock the user preferences store
vi.mock('../../stores/userPreferencesStore', async () => {
  const actual = await vi.importActual('../../stores/userPreferencesStore')
  return {
    ...actual,
    useUserPreferencesStore: vi.fn(),
  }
})

describe('ThemeProvider', () => {
  const mockSetPalette = vi.fn()

  const setupMockStore = (overrides = {}) => {
    const defaultState = {
      palette: 'gradient-blues',
      setPalette: mockSetPalette,
      fontSize: 'md',
      density: 'comfortable',
      ...overrides,
    }

    vi.mocked(userPreferencesStore.useUserPreferencesStore).mockImplementation(((
      selector?: (state: unknown) => unknown,
    ) => {
      if (selector)
        return selector(
          defaultState as unknown as ReturnType<
            typeof userPreferencesStore.useUserPreferencesStore.getState
          >,
        )
      return defaultState
    }) as typeof userPreferencesStore.useUserPreferencesStore)
  }

  beforeEach(() => {
    // Reset DOM state before each test
    document.documentElement.removeAttribute('data-palette')
    document.documentElement.removeAttribute('data-palette-type')
    document.documentElement.removeAttribute('data-density')
    document.documentElement.removeAttribute('data-font-size')
    document.documentElement.style.removeProperty('--app-font-size')
    document.documentElement.style.removeProperty('--density-scale')

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('renders children correctly', () => {
    setupMockStore()

    render(
      <ThemeProvider>
        <div data-testid="child-element">Child Content</div>
      </ThemeProvider>,
    )

    expect(screen.getByTestId('child-element')).toBeDefined()
    expect(screen.getByText('Child Content')).toBeDefined()
  })

  it('provides the correct context values', () => {
    setupMockStore({ palette: 'neon-party' })

    let contextValue: React.ContextType<typeof ThemeContext> | undefined

    const ContextConsumer = () => {
      return (
        <ThemeContext.Consumer>
          {(value) => {
            contextValue = value
            return null
          }}
        </ThemeContext.Consumer>
      )
    }

    render(
      <ThemeProvider>
        <ContextConsumer />
      </ThemeProvider>,
    )

    expect(contextValue?.palette).toBe('neon-party')

    contextValue?.setPalette('deep-ocean-blue')
    expect(mockSetPalette).toHaveBeenCalledWith('deep-ocean-blue')
  })

  describe('Palette injection', () => {
    it('applies dark palette type for dark palettes', () => {
      setupMockStore({ palette: 'neon-party' }) // neon-party is a dark palette

      render(
        <ThemeProvider>
          <div />
        </ThemeProvider>,
      )

      expect(document.documentElement.getAttribute('data-palette')).toBe('neon-party')
      expect(document.documentElement.getAttribute('data-palette-type')).toBe('dark')
    })

    it('applies light palette type for light palettes', () => {
      setupMockStore({ palette: 'minimalist-monochrome' }) // minimalist-monochrome is light

      render(
        <ThemeProvider>
          <div />
        </ThemeProvider>,
      )

      expect(document.documentElement.getAttribute('data-palette')).toBe('minimalist-monochrome')
      expect(document.documentElement.getAttribute('data-palette-type')).toBe('light')
    })
  })

  describe('Typography and Density injection', () => {
    it('applies default (md/comfortable) values correctly', () => {
      setupMockStore({ fontSize: 'md', density: 'comfortable' })

      render(
        <ThemeProvider>
          <div />
        </ThemeProvider>,
      )

      expect(document.documentElement.style.getPropertyValue('--app-font-size')).toBe('1rem')
      expect(document.documentElement.style.getPropertyValue('--density-scale')).toBe('1')
      expect(document.documentElement.dataset.fontSize).toBe('md')
      expect(document.documentElement.dataset.density).toBe('comfortable')
    })

    it('applies small font size correctly', () => {
      setupMockStore({ fontSize: 'sm' })

      render(
        <ThemeProvider>
          <div />
        </ThemeProvider>,
      )

      expect(document.documentElement.style.getPropertyValue('--app-font-size')).toBe('0.9375rem')
      expect(document.documentElement.dataset.fontSize).toBe('sm')
    })

    it('applies large font size correctly', () => {
      setupMockStore({ fontSize: 'lg' })

      render(
        <ThemeProvider>
          <div />
        </ThemeProvider>,
      )

      expect(document.documentElement.style.getPropertyValue('--app-font-size')).toBe('1.0625rem')
      expect(document.documentElement.dataset.fontSize).toBe('lg')
    })

    it('applies compact density correctly', () => {
      setupMockStore({ density: 'compact' })

      render(
        <ThemeProvider>
          <div />
        </ThemeProvider>,
      )

      expect(document.documentElement.style.getPropertyValue('--density-scale')).toBe('0.88')
      expect(document.documentElement.dataset.density).toBe('compact')
    })
  })
})
