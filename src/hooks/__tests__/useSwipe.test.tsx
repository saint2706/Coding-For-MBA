import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSwipe } from '../useSwipe'

describe('useSwipe', () => {
  let container: HTMLDivElement | null = null
  let root: ReturnType<typeof createRoot> | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    container?.remove()
    container = null
    root = null
    vi.clearAllMocks()
  })

  // A simple component to test the useSwipe hook
  function SwipeTestComponent({
    onSwipeLeft,
    onSwipeRight,
    threshold,
  }: {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    threshold?: number
  }) {
    const swipeRef = useSwipe({ onSwipeLeft, onSwipeRight, threshold })

    // We assign the ref to a div we can target
    return (
      <div ref={swipeRef} data-testid="swipe-area" style={{ width: 100, height: 100 }}>
        Swipe Area
      </div>
    )
  }

  function simulateTouch(
    element: Element,
    type: 'touchstart' | 'touchend',
    clientX: number,
    clientY: number,
  ) {
    const touch = {
      clientX,
      clientY,
    }

    const eventOptions = type === 'touchstart' ? { touches: [touch] } : { changedTouches: [touch] }

    const event = new TouchEvent(type, eventOptions as unknown as TouchEventInit)
    element.dispatchEvent(event)
  }

  it('triggers onSwipeLeft when swiping left past threshold', () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()

    act(() => {
      root?.render(<SwipeTestComponent onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />)
    })

    const swipeArea = container!.querySelector('[data-testid="swipe-area"]')!

    // Swipe left: Start at x=100, end at x=20 (diff is -80)
    act(() => {
      simulateTouch(swipeArea, 'touchstart', 100, 50)
      simulateTouch(swipeArea, 'touchend', 20, 50)
    })

    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('triggers onSwipeRight when swiping right past threshold', () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()

    act(() => {
      root?.render(<SwipeTestComponent onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />)
    })

    const swipeArea = container!.querySelector('[data-testid="swipe-area"]')!

    // Swipe right: Start at x=20, end at x=100 (diff is 80)
    act(() => {
      simulateTouch(swipeArea, 'touchstart', 20, 50)
      simulateTouch(swipeArea, 'touchend', 100, 50)
    })

    expect(onSwipeRight).toHaveBeenCalledTimes(1)
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('does not trigger callbacks if swipe is below threshold', () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()

    // Default threshold is 60, so a diff of 50 shouldn't trigger
    act(() => {
      root?.render(<SwipeTestComponent onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />)
    })

    const swipeArea = container!.querySelector('[data-testid="swipe-area"]')!

    act(() => {
      simulateTouch(swipeArea, 'touchstart', 50, 50)
      simulateTouch(swipeArea, 'touchend', 90, 50) // Right swipe of 40
    })

    act(() => {
      simulateTouch(swipeArea, 'touchstart', 90, 50)
      simulateTouch(swipeArea, 'touchend', 50, 50) // Left swipe of 40
    })

    expect(onSwipeRight).not.toHaveBeenCalled()
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('does not trigger callbacks if vertical movement is dominant', () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()

    act(() => {
      root?.render(<SwipeTestComponent onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />)
    })

    const swipeArea = container!.querySelector('[data-testid="swipe-area"]')!

    // Swipe right by 80, but down by 100
    act(() => {
      simulateTouch(swipeArea, 'touchstart', 20, 20)
      simulateTouch(swipeArea, 'touchend', 100, 120)
    })

    // Swipe left by 80, but up by 100
    act(() => {
      simulateTouch(swipeArea, 'touchstart', 100, 120)
      simulateTouch(swipeArea, 'touchend', 20, 20)
    })

    expect(onSwipeRight).not.toHaveBeenCalled()
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('supports custom threshold', () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()

    act(() => {
      root?.render(
        <SwipeTestComponent
          onSwipeLeft={onSwipeLeft}
          onSwipeRight={onSwipeRight}
          threshold={100}
        />,
      )
    })

    const swipeArea = container!.querySelector('[data-testid="swipe-area"]')!

    // Swipe right by 80, which is below the new threshold of 100
    act(() => {
      simulateTouch(swipeArea, 'touchstart', 20, 50)
      simulateTouch(swipeArea, 'touchend', 100, 50)
    })

    expect(onSwipeRight).not.toHaveBeenCalled()

    // Swipe right by 110, which is above threshold
    act(() => {
      simulateTouch(swipeArea, 'touchstart', 20, 50)
      simulateTouch(swipeArea, 'touchend', 130, 50)
    })

    expect(onSwipeRight).toHaveBeenCalledTimes(1)
  })

  it('cleans up event listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(HTMLDivElement.prototype, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(HTMLDivElement.prototype, 'removeEventListener')

    act(() => {
      root?.render(<SwipeTestComponent />)
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), {
      passive: true,
    })
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), {
      passive: true,
    })

    act(() => {
      root?.unmount()
    })

    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function))

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })
})
