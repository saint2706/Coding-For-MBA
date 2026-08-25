import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useLearningAnalytics } from '../../../src/hooks/useLearningAnalytics'
import { useLearningAnalyticsStore } from '../../../src/stores/learningAnalyticsStore'

// Mock the store
vi.mock('../../../src/stores/learningAnalyticsStore', () => {
  return {
    useLearningAnalyticsStore: {
      getState: vi.fn(),
    },
  }
})

describe('useLearningAnalytics', () => {
  let container: HTMLDivElement | null = null
  let root: ReturnType<typeof createRoot> | null = null
  let mockStoreState: Partial<ReturnType<typeof useLearningAnalyticsStore.getState>>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    mockStoreState = {
      hydrate: vi.fn(),
      startTrackingRoute: vi.fn(),
      pauseTracking: vi.fn(),
      resumeTracking: vi.fn(),
      stopTracking: vi.fn(),
    }

    vi.mocked(useLearningAnalyticsStore.getState).mockReturnValue(
      mockStoreState as ReturnType<typeof useLearningAnalyticsStore.getState>,
    )
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    container?.remove()
    container = null
    root = null
    vi.clearAllMocks()
    vi.restoreAllMocks()

    // Restore document.hidden if it was mocked
    if (Object.getOwnPropertyDescriptor(document, 'hidden')?.configurable) {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
    }
  })

  function TestComponent({ route }: { route: string }) {
    useLearningAnalytics(route)
    return null
  }

  it('hydrates and starts tracking on mount', () => {
    act(() => {
      root?.render(<TestComponent route="Lesson 1" />)
    })

    expect(mockStoreState.hydrate).toHaveBeenCalledTimes(1)
    expect(mockStoreState.startTrackingRoute).toHaveBeenCalledWith('Lesson 1')
  })

  it('re-starts tracking when route changes', () => {
    act(() => {
      root?.render(<TestComponent route="Lesson 1" />)
    })

    expect(mockStoreState.startTrackingRoute).toHaveBeenCalledWith('Lesson 1')

    act(() => {
      root?.render(<TestComponent route="Lesson 2" />)
    })

    expect(mockStoreState.startTrackingRoute).toHaveBeenCalledWith('Lesson 2')
    // hydrate should have been called twice (once for each mount/update)
    expect(mockStoreState.hydrate).toHaveBeenCalledTimes(2)
  })

  it('pauses tracking when document becomes hidden', () => {
    act(() => {
      root?.render(<TestComponent route="Lesson 1" />)
    })

    // Mock document.hidden
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })

    act(() => {
      const event = new Event('visibilitychange')
      document.dispatchEvent(event)
    })

    expect(mockStoreState.pauseTracking).toHaveBeenCalledTimes(1)
    expect(mockStoreState.resumeTracking).not.toHaveBeenCalled()
  })

  it('resumes tracking when document becomes visible', () => {
    act(() => {
      root?.render(<TestComponent route="Lesson 1" />)
    })

    // Mock document.hidden
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })

    act(() => {
      const event = new Event('visibilitychange')
      document.dispatchEvent(event)
    })

    expect(mockStoreState.resumeTracking).toHaveBeenCalledTimes(1)
    expect(mockStoreState.pauseTracking).not.toHaveBeenCalled()
  })

  it('stops tracking on beforeunload', () => {
    act(() => {
      root?.render(<TestComponent route="Lesson 1" />)
    })

    act(() => {
      const event = new Event('beforeunload')
      window.dispatchEvent(event)
    })

    expect(mockStoreState.stopTracking).toHaveBeenCalled()
  })

  it('stops tracking and cleans up on unmount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    const windowAddEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const windowRemoveEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    act(() => {
      root?.render(<TestComponent route="Lesson 1" />)
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    expect(windowAddEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    act(() => {
      root?.unmount()
    })

    expect(mockStoreState.stopTracking).toHaveBeenCalled()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })
})
