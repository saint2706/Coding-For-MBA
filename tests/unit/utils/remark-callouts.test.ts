import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import type { Blockquote, Root } from 'mdast'
import type { Element, Root as HastRoot } from 'hast'
import { remarkCallouts, type CalloutType } from '../../../src/utils/remark-callouts'
import { lessonSanitizerSchema } from '../../../src/components/MarkdownFragment'

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
    // Must be the camelCase hast property name (`ariaLabel`), not the raw
    // HTML attribute spelling (`aria-label`): mdast-util-to-hast copies
    // `hProperties` onto the hast node's `properties` verbatim, with no key
    // normalization, so a kebab-case key here would silently produce a hast
    // property nothing downstream recognizes.
    expect(hProperties.ariaLabel).toBe(`${type} callout`)
    expect(hProperties['aria-label']).toBeUndefined()
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

/**
 * Regression coverage for a real bug: `aria-label` survived the remark
 * transform (asserted above) but was silently dropped by `rehype-sanitize`
 * because `MarkdownFragment.tsx`'s schema allowlisted the wrong key casing.
 * A unit test on `remarkCallouts()` alone can't catch that class of bug — it
 * only inspects mdast/hast `hProperties`, never runs the sanitizer. These
 * tests reproduce the actual `MarkdownFragment` pipeline (remark-parse ->
 * remarkCallouts -> remark-rehype -> rehype-sanitize, using the *real*,
 * exported `lessonSanitizerSchema`) and inspect the sanitized hast tree.
 */
function sanitizeCallout(markdown: string): Element | undefined {
  const processor = unified()
    .use(remarkParse)
    .use(remarkCallouts)
    .use(remarkRehype)
    .use(rehypeSanitize, lessonSanitizerSchema)
  const tree = processor.runSync(processor.parse(markdown)) as HastRoot
  return tree.children.find(
    (node): node is Element =>
      node.type === 'element' &&
      Array.isArray(node.properties.className) &&
      (node.properties.className as string[]).includes('callout'),
  )
}

describe('remarkCallouts + rehype-sanitize (MarkdownFragment pipeline)', () => {
  it.each(types)('keeps the aria-label attribute on the sanitized %s callout div', (type) => {
    const element = sanitizeCallout(`> [!${type.toUpperCase()}]\n> Body text.`)
    expect(element).toBeDefined()
    expect(element!.properties.ariaLabel).toBe(`${type} callout`)
  })

  it('keeps className and data-callout on the sanitized div', () => {
    const element = sanitizeCallout('> [!WARNING]\n> Body text.')
    expect(element!.properties.className).toEqual(['callout', 'callout-warning'])
    expect(element!.properties.dataCallout).toBe('warning')
  })
})
