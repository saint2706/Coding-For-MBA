import { renderHook } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { useTheme } from '../useTheme'
import { ThemeContext } from '../ThemeContext'

describe('useTheme', () => {
  it('returns context value', () => {
    const mockContextValue = {
      palette: 'neon-party' as const,
      setPalette: vi.fn(),
      isDark: true,
      toggleDark: vi.fn(),
      setDark: vi.fn(),
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeContext.Provider value={mockContextValue}>
        {children}
      </ThemeContext.Provider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current).toBe(mockContextValue)
  })
})
