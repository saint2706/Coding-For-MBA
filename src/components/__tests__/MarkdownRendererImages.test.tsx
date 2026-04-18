import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MarkdownRenderer from '../MarkdownRenderer'

describe('MarkdownRenderer Images', () => {
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container) {
      document.body.removeChild(container)
      container = null
    }
  })

  it('renders images with lazy loading and async decoding', async () => {
    const content = '![Test Image](https://example.com/image.png)'

    await act(async () => {
      const root = createRoot(container!)
      root.render(<MarkdownRenderer content={content} />)
    })

    const img = container?.querySelector('img')

    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe('https://example.com/image.png')
    expect(img?.getAttribute('alt')).toBe('Test Image')
    expect(img?.getAttribute('loading')).toBe('lazy')
    expect(img?.getAttribute('decoding')).toBe('async')
  })

  it('allows fetchPriority attribute on images when using HTML syntax', async () => {
    // We use raw HTML because standard markdown doesn't support fetchPriority
    const content = '<img src="https://example.com/hero.png" alt="Hero" fetchPriority="high" />'

    await act(async () => {
      const root = createRoot(container!)
      root.render(<MarkdownRenderer content={content} />)
    })

    const img = container?.querySelector('img')

    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe('https://example.com/hero.png')
    expect(img?.getAttribute('alt')).toBe('Hero')
    expect(img?.getAttribute('fetchPriority')).toBe('high')
    expect(img?.getAttribute('loading')).toBe('eager')
  })
})
