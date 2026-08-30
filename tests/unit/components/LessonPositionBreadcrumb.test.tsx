import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import LessonPositionBreadcrumb from '../../../src/components/LessonPositionBreadcrumb'

describe('LessonPositionBreadcrumb', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined
  let originalIntersectionObserver: typeof window.IntersectionObserver
  let observerCallback: IntersectionObserverCallback | undefined
  let observeSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    originalIntersectionObserver = window.IntersectionObserver
    observeSpy = vi.fn()

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback
      }
      observe = observeSpy
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
    window.IntersectionObserver = originalIntersectionObserver
    observerCallback = undefined
    vi.restoreAllMocks()
  })

  function renderWithMasthead() {
    const mastheadEl = document.createElement('header')
    document.body.appendChild(mastheadEl)
    act(() => {
      root?.render(
        <LessonPositionBreadcrumb
          day="11B"
          totalDays={163}
          phaseNum={3}
          mastheadRef={{ current: mastheadEl }}
        />,
      )
    })
    return mastheadEl
  }

  it('renders the day, total days, and phase position', () => {
    renderWithMasthead()
    expect(container.textContent).toContain('Day 11B of 163')
    expect(container.textContent).toContain('Phase 03')
  })

  it('stays hidden while the masthead is in view', () => {
    renderWithMasthead()
    act(() => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    const el = container.querySelector('.lesson-position-breadcrumb')
    expect(el?.classList.contains('is-visible')).toBe(false)
    expect(el?.getAttribute('aria-hidden')).toBe('true')
  })

  it('becomes visible once the masthead scrolls out of view', () => {
    renderWithMasthead()
    act(() => {
      observerCallback?.(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    const el = container.querySelector('.lesson-position-breadcrumb')
    expect(el?.classList.contains('is-visible')).toBe(true)
    expect(el?.getAttribute('aria-hidden')).toBe('false')
  })

  it('observes the masthead element passed in via ref', () => {
    const mastheadEl = renderWithMasthead()
    expect(observeSpy).toHaveBeenCalledWith(mastheadEl)
  })

  it('disconnects the observer on unmount', () => {
    const mastheadEl = document.createElement('header')
    document.body.appendChild(mastheadEl)
    const localContainer = document.createElement('div')
    document.body.appendChild(localContainer)
    const localRoot = createRoot(localContainer)
    const disconnectSpy = vi.fn()

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback
      }
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = disconnectSpy
    }
    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

    act(() => {
      localRoot.render(
        <LessonPositionBreadcrumb
          day="1"
          totalDays={10}
          phaseNum={1}
          mastheadRef={{ current: mastheadEl }}
        />,
      )
    })

    act(() => {
      localRoot.unmount()
    })

    expect(disconnectSpy).toHaveBeenCalled()

    document.body.removeChild(localContainer)
    document.body.removeChild(mastheadEl)
  })
})
