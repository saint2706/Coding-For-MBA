import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import TableOfContents from '../../../src/components/TableOfContents'

describe('TableOfContents Component', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined
  let originalMatchMedia: typeof window.matchMedia
  let originalIntersectionObserver: typeof window.IntersectionObserver

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    originalMatchMedia = window.matchMedia
    originalIntersectionObserver = window.IntersectionObserver

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

    // Restore globals
    window.matchMedia = originalMatchMedia
    window.IntersectionObserver = originalIntersectionObserver
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

  it('updates compact state on window resize and handles toggle/escape', () => {
    const content = `
## Section 1
## Section 2
    `
    // Re-mock matchMedia to simulate small screen
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: true, // true means small screen (max-width: 1200px)
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    act(() => {
      root?.render(<TableOfContents content={content} />)
    })

    // Should be in compact mode, toggle button should exist
    const toggleBtn = container.querySelector('.toc-toggle')
    expect(toggleBtn).toBeTruthy()
    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false')

    // Click toggle to open
    act(() => {
      toggleBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('.toc-panel.open')).toBeTruthy()

    // Press Escape to close
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false')

    // Or press escape on the list
    act(() => {
      toggleBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('true')

    act(() => {
      container
        .querySelector('.toc-list')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false')
  })

  it('updates active id when intersection observer fires', () => {
    const content = `
## Section 1
## Section 2
    `
    let intersectionCallback: (entries: { isIntersecting: boolean; target: Element }[]) => void

    class MockIntersectionObserver {
      constructor(callback: (entries: { isIntersecting: boolean; target: Element }[]) => void) {
        intersectionCallback = callback
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

    // need elements for intersection to observe
    const s1 = document.createElement('h2')
    s1.id = 'section-1'
    document.body.appendChild(s1)

    const s2 = document.createElement('h2')
    s2.id = 'section-2'
    document.body.appendChild(s2)

    act(() => {
      root?.render(<TableOfContents content={content} />)
    })

    // Simulate s2 intersecting
    act(() => {
      intersectionCallback([
        { isIntersecting: false, target: s1 },
        { isIntersecting: true, target: s2 },
      ])
    })

    const links = container.querySelectorAll('.toc-link')
    expect(links[0].className).not.toContain('active')
    expect(links[1].className).toContain('active')

    document.body.removeChild(s1)
    document.body.removeChild(s2)
  })
})
