import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Navbar from '../Navbar'

const toastInfoMock = vi.fn()

vi.mock('../../context/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
  }),
}))

vi.mock('../../utils/toast', () => ({
  toastInfo: (...args: unknown[]) => toastInfoMock(...args),
}))

describe('Navbar Search Palette', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    toastInfoMock.mockReset()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('opens with Cmd/Ctrl+K and closes with ESC', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar onToggleSidebar={() => {}} />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    })

    const dialog = container.querySelector('[role="dialog"][aria-label="Search lessons"]')
    expect(dialog).not.toBeNull()
    expect(toastInfoMock).toHaveBeenCalledWith('Search opened — press ESC to close', {
      duration: 2000,
    })

    const paletteInput = container.querySelector('.search-input') as HTMLInputElement | null
    expect(paletteInput).not.toBeNull()

    await act(async () => {
      paletteInput?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })

    expect(container.querySelector('[role="dialog"][aria-label="Search lessons"]')).toBeNull()
    expect(toastInfoMock).toHaveBeenCalledWith('Search closed', { duration: 1200 })
  })
})
