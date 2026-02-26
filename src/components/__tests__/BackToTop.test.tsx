import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import BackToTop from '../BackToTop'

describe('BackToTop', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    // Spy on scrollTo
    vi.spyOn(window, 'scrollTo')

    // Mock scrollY
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('is initially hidden', () => {
    act(() => {
      root?.render(<BackToTop />)
    })

    const button = container.querySelector('button')
    expect(button).toBeNull()
  })

  it('becomes visible after scrolling', () => {
    act(() => {
      root?.render(<BackToTop />)
    })

    // Simulate scroll
    act(() => {
        (window as any).scrollY = 500
        window.dispatchEvent(new Event('scroll'))
    })

    // We might need to wait for re-render
    const button = container.querySelector('button')
    expect(button).toBeTruthy()
    expect(button?.classList.contains('back-to-top')).toBe(true)
  })

  it('scrolls to top when clicked', () => {
    act(() => {
      root?.render(<BackToTop />)
    })

    // Scroll down to make it visible
    act(() => {
        (window as any).scrollY = 500
        window.dispatchEvent(new Event('scroll'))
    })

    const button = container.querySelector('button')
    expect(button).toBeTruthy()

    act(() => {
        button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})
