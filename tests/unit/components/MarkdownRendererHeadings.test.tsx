import { renderToStaticMarkup } from 'react-dom/server'
import MarkdownRenderer from '../../../src/components/MarkdownRenderer'

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
    // The order of attributes in the rendered string is unpredictable/varies by React version or environment
    // so we check for both attributes independently within the tag
    expect(html).toContain('id="accessible-heading"')
    expect(html).toContain('tabindex="-1"')
    expect(html).toContain('style="outline:none"')
  })
})
