import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import Breadcrumb from '../../../src/components/Breadcrumb'

describe('Breadcrumb', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
  })

  it('renders a list of items', () => {
    const items = [
      { label: 'Home', to: '/' },
      { label: 'Phase 1', to: '/phase/1' },
      { label: 'Current Page' },
    ]

    act(() => {
      root?.render(
        <MemoryRouter>
          <Breadcrumb items={items} />
        </MemoryRouter>,
      )
    })

    const listItems = container.querySelectorAll('li.breadcrumb-item')
    expect(listItems.length).toBe(3)

    expect(listItems[0]?.textContent).toContain('Home')
    expect(listItems[1]?.textContent).toContain('Phase 1')
    expect(listItems[2]?.textContent).toContain('Current Page')
  })

  it('renders links for items with "to" prop', () => {
    const items = [{ label: 'Home', to: '/' }]

    act(() => {
      root?.render(
        <MemoryRouter>
          <Breadcrumb items={items} />
        </MemoryRouter>,
      )
    })

    const link = container.querySelector('a')
    expect(link).toBeTruthy()
    expect(link?.getAttribute('href')).toBe('/')
  })

  it('renders text for items without "to" prop', () => {
    const items = [{ label: 'Current Page' }]

    act(() => {
      root?.render(
        <MemoryRouter>
          <Breadcrumb items={items} />
        </MemoryRouter>,
      )
    })

    const link = container.querySelector('a')
    expect(link).toBeNull()
    const span = container.querySelector('span[aria-current="page"]')
    expect(span).toBeTruthy()
    expect(span?.textContent).toBe('Current Page')
  })

  it('renders separators between items', () => {
    const items = [{ label: 'Home', to: '/' }, { label: 'Page' }]

    act(() => {
      root?.render(
        <MemoryRouter>
          <Breadcrumb items={items} />
        </MemoryRouter>,
      )
    })

    const separators = container.querySelectorAll('.sep')
    expect(separators.length).toBe(1)
    expect(separators[0]?.textContent).toBe('/')
  })
})
