import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import BackToTop from '../BackToTop'
import * as motionReact from 'motion/react'

vi.mock('motion/react', async () => {
  const actual = await vi.importActual('motion/react')
  return {
    ...actual as any,
    useReducedMotion: vi.fn(),
  }
})

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

  it('becomes visible after scrolling', async () => {
    act(() => {
      root?.render(<BackToTop />)
    })

    // Simulate scroll and wait for requestAnimationFrame to execute
    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 500, configurable: true })
      window.dispatchEvent(new Event('scroll'))
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })

    // We might need to wait for re-render
    const button = container.querySelector('button')
    expect(button).toBeTruthy()
    expect(button?.classList.contains('back-to-top')).toBe(true)
  })

  it('scrolls to top when clicked', async () => {
    act(() => {
      root?.render(<BackToTop />)
    })

    // Scroll down to make it visible
    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 500, configurable: true })
      window.dispatchEvent(new Event('scroll'))
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })

    const button = container.querySelector('button')
    expect(button).toBeTruthy()

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('scrolls with auto behavior when reduced motion is preferred', async () => {
    vi.mocked(motionReact.useReducedMotion).mockReturnValue(true)

    act(() => {
      root?.render(<BackToTop />)
    })

    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 500, configurable: true })
      window.dispatchEvent(new Event('scroll'))
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })

    const button = container.querySelector('button')
    expect(button).toBeTruthy()

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('throttles multiple rapid scroll events', async () => {
    act(() => {
      root?.render(<BackToTop />)
    })

    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 500, configurable: true })
      window.dispatchEvent(new Event('scroll'))
      // Dispatch another scroll immediately to hit the ticking = true branch
      window.dispatchEvent(new Event('scroll'))
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })

    const button = container.querySelector('button')
    expect(button).toBeTruthy()

  })
})
