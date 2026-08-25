import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MarkdownRenderer from '../../../src/components/MarkdownRenderer'

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

  it('renders a standalone image inside a figure with a visible figcaption', async () => {
    const content = '![A diagram of the sales funnel](https://example.com/funnel.png)'

    await act(async () => {
      const root = createRoot(container!)
      root.render(<MarkdownRenderer content={content} />)
    })

    const figure = container?.querySelector('figure.markdown-image-figure')
    expect(figure).not.toBeNull()
    expect(figure?.querySelector('img')).not.toBeNull()

    const figcaption = figure?.querySelector('figcaption')
    expect(figcaption?.textContent).toBe('A diagram of the sales funnel')
  })

  it('omits the figcaption when the image has no alt text', async () => {
    const content = '![](https://example.com/decorative.png)'

    await act(async () => {
      const root = createRoot(container!)
      root.render(<MarkdownRenderer content={content} />)
    })

    const figure = container?.querySelector('figure.markdown-image-figure')
    expect(figure).not.toBeNull()
    expect(figure?.querySelector('figcaption')).toBeNull()
  })
})
