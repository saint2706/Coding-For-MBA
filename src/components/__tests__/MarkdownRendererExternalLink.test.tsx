import { renderToStaticMarkup } from 'react-dom/server'
import MarkdownRenderer from '../MarkdownRenderer'

describe('MarkdownRenderer external links', () => {
  it('adds an external link icon to https links', () => {
    const content = '[Google](https://google.com)'
    const html = renderToStaticMarkup(<MarkdownRenderer content={content} />)

    // Check for target="_blank"
    expect(html).toContain('target="_blank"')
    // Check for rel="noopener noreferrer"
    expect(html).toContain('rel="noopener noreferrer"')
    // Check for sr-only text
    expect(html).toContain('<span class="sr-only"> (opens in a new tab)</span>')
    // Check for SVG
    expect(html).toContain('<svg aria-hidden="true"')
  })

  it('does not add an external link icon to internal links', () => {
    const content = '[Home](/)'
    const html = renderToStaticMarkup(<MarkdownRenderer content={content} />)

    // Check for target="_blank" absence
    expect(html).not.toContain('target="_blank"')
    // Check for sr-only text absence
    expect(html).not.toContain('(opens in a new tab)')
    // Check for SVG absence
    expect(html).not.toContain('<svg aria-hidden="true"')
  })
})
