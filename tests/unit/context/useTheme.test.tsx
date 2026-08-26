import { renderHook } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { ReactNode } from 'react'
import { useTheme } from '../../../src/context/useTheme'
import { ThemeContext } from '../../../src/context/ThemeContext'
import type { ColorPalette } from '../../../src/stores/userPreferencesStore'

describe('useTheme', () => {
  it('returns the default context value when not wrapped in a provider', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.palette).toBe('terminal-dark')
    expect(typeof result.current.setPalette).toBe('function')
  })

  it('returns the provided context value when wrapped in a provider', () => {
    const mockSetPalette = vi.fn()
    const customPalette: ColorPalette = 'signal-rose'

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeContext.Provider value={{ palette: customPalette, setPalette: mockSetPalette }}>
        {children}
      </ThemeContext.Provider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.palette).toBe(customPalette)

    // Test the setPalette function
    result.current.setPalette('high-contrast')
    expect(mockSetPalette).toHaveBeenCalledWith('high-contrast')
  })
})
