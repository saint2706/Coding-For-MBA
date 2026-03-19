import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import TableOfContents from '../TableOfContents'

describe('TableOfContents Component', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // Mock IntersectionObserver
    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('renders null if less than 2 headings', () => {
    act(() => {
      root?.render(<TableOfContents content="# Only one heading" />)
    })
    expect(container.innerHTML).toBe('')
  })

  it('renders toc items for multiple headings', () => {
    const content = `
## Section 1
Content 1
## Section 2
Content 2
### Sub 2.1
Content 2.1
    `
    act(() => {
      root?.render(<TableOfContents content={content} />)
    })

    expect(container.querySelector('.toc')).toBeTruthy()
    const links = container.querySelectorAll('.toc-link')
    expect(links.length).toBe(3)
    expect(links[0].textContent).toBe('Section 1')
    expect(links[1].textContent).toBe('Section 2')
    expect(links[2].textContent).toBe('Sub 2.1')
  })

  it('handles heading click', () => {
    const content = `
## target-section
Content
## Section 2
Content
    `
    // Create a mock target element
    const targetElement = document.createElement('h2')
    targetElement.id = 'target-section'
    targetElement.scrollIntoView = vi.fn()
    targetElement.focus = vi.fn()
    document.body.appendChild(targetElement)

    act(() => {
      root?.render(<TableOfContents content={content} />)
    })

    const link = container.querySelector('.toc-link')
    expect(link).toBeTruthy()

    act(() => {
      link?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(targetElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
    expect(targetElement.focus).toHaveBeenCalledWith({ preventScroll: true })

    document.body.removeChild(targetElement)
  })
})
