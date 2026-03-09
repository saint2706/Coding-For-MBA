import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import SkipToContent from '../SkipToContent'

describe('SkipToContent', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined
  let mainContent: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    // Setup a mock main content element
    mainContent = document.createElement('main')
    mainContent.id = 'main-content'
    mainContent.tabIndex = -1 // Needed to be focusable programmatically
    document.body.appendChild(mainContent)
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
    document.body.removeChild(mainContent)
    vi.restoreAllMocks()
  })

  it('renders a skip link with correct href and text', () => {
    act(() => {
      root?.render(<SkipToContent />)
    })

    const link = container.querySelector('a')
    expect(link).toBeTruthy()
    expect(link?.getAttribute('href')).toBe('#main-content')
    expect(link?.textContent).toBe('Skip to content')
    expect(link?.classList.contains('skip-to-content')).toBe(true)
  })

  it('moves focus to #main-content when clicked', () => {
    act(() => {
      root?.render(<SkipToContent />)
    })

    const link = container.querySelector('a')
    expect(link).toBeTruthy()

    const focusSpy = vi.spyOn(mainContent, 'focus')

    act(() => {
      link?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(focusSpy).toHaveBeenCalledTimes(1)
  })

  it('does not throw error if #main-content is not found', () => {
    document.body.removeChild(mainContent)

    act(() => {
      root?.render(<SkipToContent />)
    })

    const link = container.querySelector('a')
    expect(link).toBeTruthy()

    // Simulate click - should not throw
    expect(() => {
      act(() => {
        link?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      })
    }).not.toThrow()

    // Put it back for afterEach cleanup
    document.body.appendChild(mainContent)
  })
})
