import { renderHook } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { ReactNode } from 'react'
import { useTheme } from '../useTheme'
import { ThemeContext } from '../ThemeContext'
import type { ColorPalette } from '../../stores/userPreferencesStore'

describe('useTheme', () => {
  it('returns the default context value when not wrapped in a provider', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.palette).toBe('gradient-blues')
    expect(typeof result.current.setPalette).toBe('function')
  })

  it('returns the provided context value when wrapped in a provider', () => {
    const mockSetPalette = vi.fn()
    const customPalette: ColorPalette = 'neon-party'

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeContext.Provider value={{ palette: customPalette, setPalette: mockSetPalette }}>
        {children}
      </ThemeContext.Provider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.palette).toBe(customPalette)

    // Test the setPalette function
    result.current.setPalette('pastel-dreamland')
    expect(mockSetPalette).toHaveBeenCalledWith('pastel-dreamland')
  })
})
