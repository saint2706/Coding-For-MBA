import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../Navbar'

const toggleThemeMock = vi.fn()
const toastInfoMock = vi.fn()

vi.mock('../../context/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: toggleThemeMock,
  }),
}))

vi.mock('../../utils/toast', () => ({
  toastInfo: (message: string) => toastInfoMock(message),
}))

describe('Navbar', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    toggleThemeMock.mockClear()
    toastInfoMock.mockClear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('invokes toast helper after clicking theme toggle', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar onToggleSidebar={() => {}} />
        </MemoryRouter>,
      )
    })

    const themeToggle = container.querySelector('.theme-toggle') as HTMLButtonElement
    expect(themeToggle).not.toBeNull()

    await act(async () => {
      themeToggle.click()
    })

    expect(toggleThemeMock).toHaveBeenCalledTimes(1)
    expect(toastInfoMock).toHaveBeenCalledWith('Switched to dark mode')
  })

  it('shows and handles clear button when typing in search', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar onToggleSidebar={() => {}} />
        </MemoryRouter>,
      )
    })

    const input = container.querySelector('input[type="search"]') as HTMLInputElement
    expect(input).not.toBeNull()
    expect(container.querySelector('.navbar-search-clear')).toBeNull()

    // Type query
    await act(async () => {
      // Simulate typing
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      nativeInputValueSetter?.call(input, 'test query')

      const event = new Event('input', { bubbles: true })
      input.dispatchEvent(event)
    })

    // Verify clear button appears
    const clearBtn = container.querySelector('.navbar-search-clear') as HTMLButtonElement
    expect(clearBtn).not.toBeNull()

    // Click clear
    await act(async () => {
      clearBtn.click()
    })

    // Verify cleared
    expect(input.value).toBe('')
    expect(document.activeElement).toBe(input)
  })
})
