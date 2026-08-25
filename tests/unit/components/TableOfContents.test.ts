import { parseHeadings } from '../../../src/utils/toc'

describe('parseHeadings', () => {
  it('uses shared slug normalization for emphasis, inline code, symbols, and duplicates', () => {
    const content = [
      '# Intro',
      '## **Profit** `Growth` & ROI!!!',
      '### Profit Growth ROI',
      '## Repeat Title',
      '## Repeat Title',
    ].join('\n')

    expect(parseHeadings(content)).toEqual([
      { id: 'profit-growth-roi', text: 'Profit Growth & ROI!!!', level: 2 },
      { id: 'profit-growth-roi-1', text: 'Profit Growth ROI', level: 3 },
      { id: 'repeat-title', text: 'Repeat Title', level: 2 },
      { id: 'repeat-title-1', text: 'Repeat Title', level: 2 },
    ])
  })
})
