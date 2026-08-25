import { render, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import CustomCursor from '../../../src/components/CustomCursor'
import * as motion from 'motion/react'

vi.mock('motion/react', () => ({
  useReducedMotion: vi.fn(),
}))

describe('CustomCursor', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>
  let removeListenerMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    removeListenerMock = vi.fn()
    mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: removeListenerMock,
      addEventListener: vi.fn(),
      removeEventListener: removeListenerMock,
      dispatchEvent: vi.fn(),
    }))
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })
    vi.mocked(motion.useReducedMotion).mockReturnValue(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders nothing if pointer is not fine', () => {
    mockMatchMedia.mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    const { container } = render(<CustomCursor />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing if reduced motion is enabled', () => {
    vi.mocked(motion.useReducedMotion).mockReturnValue(true)
    const { container } = render(<CustomCursor />)
    expect(container.firstChild).toBeNull()
  })

  it('renders custom cursor dots if enabled', () => {
    const { container } = render(<CustomCursor />)
    expect(container.querySelector('.custom-cursor-dot')).toBeDefined()
    expect(container.querySelector('.custom-cursor-ring')).toBeDefined()
  })

  it('updates transform on mouse move', () => {
    const { container } = render(<CustomCursor />)
    const dot = container.querySelector('.custom-cursor-dot') as HTMLElement
    const ring = container.querySelector('.custom-cursor-ring') as HTMLElement

    act(() => {
      fireEvent.mouseMove(window, { clientX: 100, clientY: 200 })
      vi.runAllTimers()
    })

    expect(dot.style.transform).toBe('translate(100px, 200px)')
    expect(ring.style.transform).toBe('translate(100px, 200px) scale(1)')
  })

  it('adds hover class on interactive elements', () => {
    const { container } = render(
      <>
        <button id="interactive-btn">Click me</button>
        <CustomCursor />
      </>,
    )

    const btn = document.getElementById('interactive-btn')
    const ring = container.querySelector('.custom-cursor-ring') as HTMLElement

    act(() => {
      fireEvent.mouseOver(btn!)
    })

    expect(ring.className).toContain('custom-cursor-ring--hover')

    act(() => {
      fireEvent.mouseOut(btn!)
    })

    expect(ring.className).not.toContain('custom-cursor-ring--hover')
  })
})
