import { render, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import CustomCursor from '../CustomCursor'

vi.mock('motion/react', () => ({
  useReducedMotion: vi.fn().mockReturnValue(false)
}))

describe('CustomCursor', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(pointer: fine)',
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    document.documentElement.classList.remove('custom-cursor-active')
    vi.unstubAllGlobals()
  })

  it('renders custom cursor on fine pointer devices', () => {
    const { container } = render(<CustomCursor />)
    expect(container.querySelector('.custom-cursor-dot')).not.toBeNull()
    expect(container.querySelector('.custom-cursor-ring')).not.toBeNull()
    expect(document.documentElement.classList.contains('custom-cursor-active')).toBe(true)
  })

  it('does not render on touch devices', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { container } = render(<CustomCursor />)
    expect(container.querySelector('.custom-cursor-dot')).toBeNull()
  })

  it('handles mouse movements and interactions', async () => {
    // Make sure we simulate a fine pointer
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(pointer: fine)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { container } = render(<CustomCursor />)

    // Test mouse movement
    const moveEvent = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 200,
      bubbles: true,
    })

    // Create RAF mock
    let rafCallback: FrameRequestCallback | null = null
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallback = cb
      return 1
    })

    act(() => {
      window.dispatchEvent(moveEvent)
      if (rafCallback) {
        // @ts-ignore
        rafCallback(1)
      }
    })

    const dot = container.querySelector('.custom-cursor-dot') as HTMLElement
    expect(dot).not.toBeNull()
    expect(dot.style.transform).toBe('translate(100px, 200px)')

    const ring = container.querySelector('.custom-cursor-ring') as HTMLElement
    expect(ring.style.transform).toBe('translate(100px, 200px) scale(1)')

    // Test interactive element hover
    const button = document.createElement('button')
    button.className = 'interactive'
    document.body.appendChild(button)

    const mouseOverEvent = new MouseEvent('mouseover', { bubbles: true })
    Object.defineProperty(mouseOverEvent, 'target', { value: button })

    act(() => {
      window.dispatchEvent(mouseOverEvent)
    })

    // trigger move again to update ring scale
    act(() => {
      window.dispatchEvent(moveEvent)
      if (rafCallback) {
        // @ts-ignore
        rafCallback(1)
      }
    })

    expect(ring.style.transform).toBe('translate(100px, 200px) scale(1.6)')

    // trigger mouseout
    const mouseOutEvent = new MouseEvent('mouseout', { bubbles: true })
    Object.defineProperty(mouseOutEvent, 'target', { value: button })

    act(() => {
      window.dispatchEvent(mouseOutEvent)
    })

    // trigger move again to verify scale is back to 1
    act(() => {
      window.dispatchEvent(moveEvent)
      if (rafCallback) {
        // @ts-ignore
        rafCallback(1)
      }
    })

    expect(ring.style.transform).toBe('translate(100px, 200px) scale(1)')

    document.body.removeChild(button)
  })

  it('updates when matchMedia changes', () => {
    let changeListener: ((e: any) => void) | null = null
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(pointer: fine)',
      addEventListener: vi.fn((event, cb) => {
        if (event === 'change') changeListener = cb
      }),
      removeEventListener: vi.fn(),
    }))

    const { container } = render(<CustomCursor />)
    expect(container.querySelector('.custom-cursor-dot')).not.toBeNull()

    act(() => {
      if (changeListener) {
        // @ts-ignore
        changeListener({ matches: false })
      }
    })

    // The component state updated, so it should unmount the cursor elements
    expect(container.querySelector('.custom-cursor-dot')).toBeNull()
  })
})
