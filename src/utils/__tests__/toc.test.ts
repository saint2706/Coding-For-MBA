import { describe, it, expect } from 'vitest'
import { parseHeadings } from '../toc'

describe('parseHeadings', () => {
  it('should extract H2 and H3 headings correctly', () => {
    const markdown = `
# Title (should be ignored)

## Subtitle 1

Some text.

### Sub-subtitle 1.1

More text.

## Subtitle 2
    `
    const result = parseHeadings(markdown)

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ id: 'subtitle-1', text: 'Subtitle 1', level: 2 })
    expect(result[1]).toEqual({ id: 'sub-subtitle-1-1', text: 'Sub-subtitle 1.1', level: 3 })
    expect(result[2]).toEqual({ id: 'subtitle-2', text: 'Subtitle 2', level: 2 })
  })

  it('should ignore headings outside H2 and H3', () => {
    const markdown = `
# H1
## H2
### H3
#### H4
##### H5
###### H6
    `
    const result = parseHeadings(markdown)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: 'h2', text: 'H2', level: 2 })
    expect(result[1]).toEqual({ id: 'h3', text: 'H3', level: 3 })
  })

  it('should ignore headings inside code blocks', () => {
    const markdown = `
## Main Heading

\`\`\`python
# This is a comment, not a heading
## This looks like a heading but is in a code block
\`\`\`

### Another Heading
    `
    const result = parseHeadings(markdown)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: 'main-heading', text: 'Main Heading', level: 2 })
    expect(result[1]).toEqual({ id: 'another-heading', text: 'Another Heading', level: 3 })
  })

  it('should strip markdown inline formatting from heading text', () => {
    const markdown = `
## **Bold** and *Italic* Heading

### \`Code\` Heading [Link](https://example.com)
    `
    const result = parseHeadings(markdown)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 'bold-and-italic-heading',
      text: 'Bold and Italic Heading',
      level: 2,
    })
    // Links and code will be stripped as per stripMarkdownInlineFormatting behaviour
    expect(result[1]).toEqual({ id: 'code-heading-link', text: 'Code Heading Link', level: 3 })
  })
})
