import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../Navbar'

const toastInfoMock = vi.fn()

vi.mock('../../utils/toast', () => ({
  toastInfo: (message: string) => toastInfoMock(message),
}))

describe('Navbar', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
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

  it('renders brand link and navigation links', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar sidebarOpen={false} onToggleSidebar={() => {}} />
        </MemoryRouter>,
      )
    })

    const brandLink = container.querySelector('.navbar-brand')
    expect(brandLink).not.toBeNull()

    expect(container.querySelector('.theme-toggle')).toBeNull()
  })

  it('shows and handles clear button when typing in search', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar sidebarOpen={false} onToggleSidebar={() => {}} />
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
