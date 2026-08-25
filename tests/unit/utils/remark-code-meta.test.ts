import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import type { Code, Root } from 'mdast'
import { parseHighlightLines, remarkCodeMeta } from '../../../src/utils/remark-code-meta'

function parseCodeNode(markdown: string): Code {
  const processor = unified().use(remarkParse).use(remarkCodeMeta)
  const tree = processor.runSync(processor.parse(markdown)) as Root
  const code = tree.children.find((node): node is Code => node.type === 'code')
  if (!code) throw new Error('no code node found')
  return code
}

describe('parseHighlightLines', () => {
  it('parses comma-separated line numbers', () => {
    expect(parseHighlightLines('1,3,5')).toEqual([1, 3, 5])
  })

  it('expands ranges', () => {
    expect(parseHighlightLines('7-9')).toEqual([7, 8, 9])
  })

  it('handles reversed ranges', () => {
    expect(parseHighlightLines('9-7')).toEqual([7, 8, 9])
  })

  it('dedupes and sorts mixed specs', () => {
    expect(parseHighlightLines('5, 1-3, 3')).toEqual([1, 2, 3, 5])
  })

  it('ignores empty segments', () => {
    expect(parseHighlightLines('1,,3')).toEqual([1, 3])
  })
})

describe('remarkCodeMeta', () => {
  it('flags a bare ```diff fence as diff mode', () => {
    const code = parseCodeNode('```diff\n+a\n-b\n```')
    const hProperties = code.data?.hProperties as Record<string, unknown> | undefined
    expect(hProperties?.dataDiff).toBe('true')
    expect(hProperties?.dataHighlightLines).toBeUndefined()
  })

  it('flags ```python diff via the diff keyword in meta', () => {
    const code = parseCodeNode('```python diff\nprint("a")\n```')
    const hProperties = code.data?.hProperties as Record<string, unknown> | undefined
    expect(hProperties?.dataDiff).toBe('true')
  })

  it('sets dataHighlightLines from a {a,b-c} meta range', () => {
    const code = parseCodeNode('```python {2,4-5}\nline1\nline2\nline3\n```')
    const hProperties = code.data?.hProperties as Record<string, unknown> | undefined
    expect(hProperties?.dataHighlightLines).toBe('2,4,5')
    expect(hProperties?.dataDiff).toBeUndefined()
  })

  it('combines diff and highlight-line flags in one meta string', () => {
    const code = parseCodeNode('```python diff {1}\n+a\n```')
    const hProperties = code.data?.hProperties as Record<string, unknown> | undefined
    expect(hProperties?.dataDiff).toBe('true')
    expect(hProperties?.dataHighlightLines).toBe('1')
  })

  it('leaves plain fences untouched', () => {
    const code = parseCodeNode('```python\nprint("a")\n```')
    expect(code.data?.hProperties).toBeUndefined()
  })
})
