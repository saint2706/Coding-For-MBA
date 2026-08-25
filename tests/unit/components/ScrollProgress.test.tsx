import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import ScrollProgress from '../../../src/components/ScrollProgress'

describe('ScrollProgress', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    // Mock window properties
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 500 })
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 })

    // Mock document properties
    Object.defineProperty(document.documentElement, 'scrollHeight', { writable: true, value: 1000 })
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('calculates global scroll progress correctly', async () => {
    act(() => {
      root?.render(<ScrollProgress />)
    })

    const progressbar = container.querySelector('.scroll-progress')
    const bar = container.querySelector('.scroll-progress-bar') as HTMLElement

    // Initial state (scrollY = 0, scrollHeight = 1000, innerHeight = 500)
    // Progress should be 0
    expect(progressbar?.getAttribute('aria-valuenow')).toBe('0')
    expect(bar.style.width).toBe('0%')

    // Scroll halfway
    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 250 })
      window.dispatchEvent(new Event('scroll'))
      // Wait for requestAnimationFrame
      await new Promise((r) => requestAnimationFrame(r))
    })

    // Progress = 250 / (1000 - 500) = 0.5 = 50%
    expect(progressbar?.getAttribute('aria-valuenow')).toBe('50')
    expect(bar.style.width).toBe('50%')
  })

  it('calculates targeted element scroll progress correctly', async () => {
    // Setup target element
    const target = document.createElement('div')
    target.id = 'target-id'

    // Mock target properties
    Object.defineProperty(target, 'clientHeight', { value: 2000 })
    // Mock getBoundingClientRect
    target.getBoundingClientRect = vi.fn().mockReturnValue({ top: -500 })
    document.body.appendChild(target)

    act(() => {
      root?.render(<ScrollProgress targetSelector="#target-id" />)
    })

    const progressbar = container.querySelector('.scroll-progress')
    const bar = container.querySelector('.scroll-progress-bar') as HTMLElement

    // Progress = scrolled (-top) / (elementHeight - windowHeight)
    // Progress = 500 / (2000 - 500) = 500 / 1500 = 33.33%
    expect(progressbar?.getAttribute('aria-valuenow')).toBe('33')
    expect(bar.style.width).toBe('33.33333333333333%')

    document.body.removeChild(target)
  })

  it('adds lesson-progress class if isLesson is true', () => {
    act(() => {
      root?.render(<ScrollProgress isLesson={true} />)
    })

    const progressbar = container.querySelector('.scroll-progress')
    expect(progressbar?.classList.contains('lesson-progress')).toBe(true)
  })
})
