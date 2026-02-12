import { createElement } from 'react'
import { createSlugger, extractTextFromReactNode, stripMarkdownInlineFormatting } from '../slug'

describe('slug utilities', () => {
  it('strips markdown inline formatting from heading text', () => {
    expect(stripMarkdownInlineFormatting('**Profit** `Growth` & ROI!!!')).toBe(
      'Profit Growth & ROI!!!',
    )
  })

  it('extracts text from nested React nodes', () => {
    const node = [
      'Profit ',
      createElement('em', { key: '1' }, 'Growth'),
      ' ',
      createElement('code', { key: '2' }, 'Q4'),
      ' & ROI',
    ]

    expect(extractTextFromReactNode(node)).toBe('Profit Growth Q4 & ROI')
  })

  it('normalizes symbols, casing, whitespace, and duplicates', () => {
    const slugger = createSlugger()

    expect(slugger.slug('  Profit   Growth & ROI!!! ')).toBe('profit-growth-roi')
    expect(slugger.slug('Profit Growth ROI')).toBe('profit-growth-roi-1')
    expect(slugger.slug('PROFIT growth roi')).toBe('profit-growth-roi-2')
  })
})
