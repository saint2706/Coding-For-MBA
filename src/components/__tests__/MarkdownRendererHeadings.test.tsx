import { renderToStaticMarkup } from 'react-dom/server'
import MarkdownRenderer from '../MarkdownRenderer'

describe('MarkdownRenderer heading ids', () => {
  it('applies shared slug rules to formatted and repeated headings', () => {
    const content = [
      '## **Profit** `Growth` & ROI!!!',
      '### Profit Growth ROI',
      '## Repeat Title',
      '## Repeat Title',
    ].join('\n')

    const html = renderToStaticMarkup(<MarkdownRenderer content={content} />)

    expect(html).toMatch(/<h2[^>]*id="profit-growth-roi"/)
    expect(html).toMatch(/<h3[^>]*id="profit-growth-roi-1"/)
    expect(html).toMatch(/<h2[^>]*id="repeat-title"/)
    expect(html).toMatch(/<h2[^>]*id="repeat-title-1"/)
  })

  it('adds tabIndex="-1" to headings for programmatic focus', () => {
    const content = '# Accessible Heading'
    const html = renderToStaticMarkup(<MarkdownRenderer content={content} />)
    expect(html).toMatch(/<h1[^>]*id="accessible-heading"[^>]*tabindex="-1"/)
  })
})
