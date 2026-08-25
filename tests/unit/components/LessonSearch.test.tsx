import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import LessonSearch from '../../../src/components/LessonSearch'

function dispatchKeyDown(target: EventTarget, key: string, init: KeyboardEventInit = {}) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
  )
}

function setInputValue(input: HTMLInputElement, value: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )?.set
  nativeInputValueSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('LessonSearch', () => {
  let container: HTMLDivElement
  let root: Root
  let article: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    article = document.createElement('article')
    article.innerHTML = '<p>The quick brown fox jumps over the lazy dog. Fox again.</p>'
    document.body.appendChild(article)

    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
    document.body.removeChild(article)
    vi.restoreAllMocks()
  })

  it('renders nothing until "/" is pressed', () => {
    act(() => {
      root.render(<LessonSearch containerRef={{ current: article }} />)
    })

    expect(container.querySelector('.lesson-search-bar')).toBeNull()

    act(() => {
      dispatchKeyDown(window, '/')
    })

    expect(container.querySelector('.lesson-search-bar')).toBeTruthy()
  })

  it('highlights matches in the article and reports a match count', async () => {
    act(() => {
      root.render(<LessonSearch containerRef={{ current: article }} />)
    })
    act(() => {
      dispatchKeyDown(window, '/')
    })

    const input = container.querySelector('.lesson-search-input') as HTMLInputElement
    await act(async () => {
      setInputValue(input, 'fox')
    })

    const matches = article.querySelectorAll('mark.lesson-search-match')
    expect(matches.length).toBe(2)
    expect(container.querySelector('.lesson-search-count')?.textContent).toBe('1/2')
    expect(matches[0]?.classList.contains('lesson-search-match-active')).toBe(true)
  })

  it('jumps to the next match on Enter and wraps around', async () => {
    act(() => {
      root.render(<LessonSearch containerRef={{ current: article }} />)
    })
    act(() => {
      dispatchKeyDown(window, '/')
    })

    const input = container.querySelector('.lesson-search-input') as HTMLInputElement
    await act(async () => {
      setInputValue(input, 'fox')
    })

    await act(async () => {
      dispatchKeyDown(input, 'Enter')
    })
    expect(container.querySelector('.lesson-search-count')?.textContent).toBe('2/2')

    await act(async () => {
      dispatchKeyDown(input, 'Enter')
    })
    expect(container.querySelector('.lesson-search-count')?.textContent).toBe('1/2')
  })

  it('clears highlights and closes on Escape', async () => {
    act(() => {
      root.render(<LessonSearch containerRef={{ current: article }} />)
    })
    act(() => {
      dispatchKeyDown(window, '/')
    })

    const input = container.querySelector('.lesson-search-input') as HTMLInputElement
    await act(async () => {
      setInputValue(input, 'fox')
    })
    expect(article.querySelectorAll('mark.lesson-search-match').length).toBe(2)

    await act(async () => {
      dispatchKeyDown(input, 'Escape')
    })

    expect(container.querySelector('.lesson-search-bar')).toBeNull()
    expect(article.querySelectorAll('mark.lesson-search-match').length).toBe(0)
    expect(article.textContent).toBe('The quick brown fox jumps over the lazy dog. Fox again.')
  })
})
