import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import type { Blockquote, Root } from 'mdast'
import { remarkCallouts, type CalloutType } from '../../../src/utils/remark-callouts'

function parseCalloutNode(markdown: string): Blockquote | undefined {
  const processor = unified().use(remarkParse).use(remarkCallouts)
  const tree = processor.runSync(processor.parse(markdown)) as Root
  return tree.children.find(
    (node): node is Blockquote =>
      node.type === 'blockquote' &&
      (node.data as Record<string, unknown> | undefined)?.hName === 'div',
  )
}

const types: CalloutType[] = ['note', 'tip', 'important', 'warning', 'danger']

describe('remarkCallouts', () => {
  it.each(types)('tags a [!%s] blockquote as a callout div', (type) => {
    const node = parseCalloutNode(`> [!${type.toUpperCase()}]\n> Body text.`)
    expect(node).toBeDefined()
    const hProperties = node!.data!.hProperties as Record<string, unknown>
    expect(hProperties.className).toEqual(['callout', `callout-${type}`])
    expect(hProperties.dataCallout).toBe(type)
  })

  it.each(types)('sets an aria-label naming the callout type for %s', (type) => {
    const node = parseCalloutNode(`> [!${type.toUpperCase()}]\n> Body text.`)
    const hProperties = node!.data!.hProperties as Record<string, unknown>
    expect(hProperties['aria-label']).toBe(`${type} callout`)
  })

  it('is case-insensitive on the marker', () => {
    const node = parseCalloutNode('> [!note]\n> Body text.')
    const hProperties = node!.data!.hProperties as Record<string, unknown>
    expect(hProperties.dataCallout).toBe('note')
  })

  it('strips the marker from the leading paragraph text', () => {
    const node = parseCalloutNode('> [!NOTE]\n> Body text.')
    const paragraph = node!.children[0]
    expect(paragraph?.type).toBe('paragraph')
    const firstInline = paragraph?.type === 'paragraph' ? paragraph.children[0] : undefined
    expect(firstInline?.type === 'text' ? firstInline.value : undefined).toBe('Body text.')
  })

  it('leaves plain blockquotes untouched', () => {
    const node = parseCalloutNode('> Just a quote, no marker.')
    expect(node).toBeUndefined()
  })
})
