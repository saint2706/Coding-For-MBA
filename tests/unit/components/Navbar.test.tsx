import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../../../src/components/Navbar'

const toastInfoMock = vi.fn()

vi.mock('../../../src/utils/toast', () => ({
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

  it('submits search form with query', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar sidebarOpen={false} onToggleSidebar={() => {}} />
        </MemoryRouter>,
      )
    })

    const input = container.querySelector('input[type="search"]') as HTMLInputElement
    const form = container.querySelector('.navbar-search-form') as HTMLFormElement

    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      nativeInputValueSetter?.call(input, 'test query')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
  })

  it('submits search form without query', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar sidebarOpen={false} onToggleSidebar={() => {}} />
        </MemoryRouter>,
      )
    })

    const form = container.querySelector('.navbar-search-form') as HTMLFormElement
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
  })

  it('focuses search input when / is pressed', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar sidebarOpen={false} onToggleSidebar={() => {}} />
        </MemoryRouter>,
      )
    })

    const input = container.querySelector('input[type="search"]') as HTMLInputElement

    await act(async () => {
      const event = new KeyboardEvent('keydown', { key: '/', bubbles: true })
      window.dispatchEvent(event)
    })

    expect(document.activeElement).toBe(input)
    expect(toastInfoMock).toHaveBeenCalledWith(
      'Search opened. Type a query and press Enter. Press Esc to close.',
    )
  })

  it('skips / shortcut when in editable element', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar sidebarOpen={false} onToggleSidebar={() => {}} />
          <input type="text" id="test-input" />
        </MemoryRouter>,
      )
    })

    const testInput = container.querySelector('#test-input') as HTMLInputElement
    testInput.focus()

    await act(async () => {
      const event = new KeyboardEvent('keydown', { key: '/', bubbles: true })
      testInput.dispatchEvent(event)
    })

    expect(document.activeElement).toBe(testInput)
  })

  it('skips / shortcut on /search page', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/search']}>
          <Navbar sidebarOpen={false} onToggleSidebar={() => {}} />
        </MemoryRouter>,
      )
    })

    const input = container.querySelector('input[type="search"]') as HTMLInputElement
    input.blur()

    await act(async () => {
      const event = new KeyboardEvent('keydown', { key: '/', bubbles: true })
      window.dispatchEvent(event)
    })

    expect(document.activeElement).not.toBe(input)
  })

  it('clears and closes search when Escape is pressed while focused', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Navbar sidebarOpen={false} onToggleSidebar={() => {}} />
        </MemoryRouter>,
      )
    })

    const input = container.querySelector('input[type="search"]') as HTMLInputElement
    input.focus()

    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      nativeInputValueSetter?.call(input, 'test query')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })

    expect(input.value).toBe('test query')

    await act(async () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      window.dispatchEvent(event)
    })

    expect(input.value).toBe('')
    expect(toastInfoMock).toHaveBeenCalledWith('Search closed. Press / to reopen quickly.')
  })
})
