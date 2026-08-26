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

  it.each(types)('injects a visually-hidden text node naming the callout type for %s', (type) => {
    const node = parseCalloutNode(`> [!${type.toUpperCase()}]\n> Body text.`)
    const srNode = node!.children[0]
    expect(srNode?.type).toBe('paragraph')
    const srData =
      srNode?.type === 'paragraph' ? (srNode.data as Record<string, unknown>) : undefined
    expect(srData?.hName).toBe('span')
    expect((srData?.hProperties as Record<string, unknown>)?.className).toEqual(['sr-only'])
    const srText = srNode?.type === 'paragraph' ? srNode.children[0] : undefined
    expect(srText?.type === 'text' ? srText.value : undefined).toBe(`${type} callout`)

    const hProperties = node!.data!.hProperties as Record<string, unknown>
    expect(hProperties.ariaLabel).toBeUndefined()
  })

  it('is case-insensitive on the marker', () => {
    const node = parseCalloutNode('> [!note]\n> Body text.')
    const hProperties = node!.data!.hProperties as Record<string, unknown>
    expect(hProperties.dataCallout).toBe('note')
  })

  it('strips the marker from the leading paragraph text', () => {
    const node = parseCalloutNode('> [!NOTE]\n> Body text.')
    // children[0] is the injected sr-only label node; the body paragraph
    // follows it.
    const paragraph = node!.children[1]
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
 * Regression coverage for a real bug: an `aria-label` on the callout's
 * wrapping `<div>` survived the remark transform and the sanitizer, but
 * still produced no accessible name in browsers/AT — under ARIA 1.2 a bare
 * `<div>`'s implicit role is `generic`, and `generic` elements are
 * prohibited from having `aria-label`/`aria-labelledby`. The fix replaces
 * the attribute with a real visually-hidden text node (`<span class="sr-only">`)
 * as the div's first child, which has no such restriction. A unit test on
 * `remarkCallouts()` alone can't verify the text survives sanitization — it
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
  it.each(types)(
    'keeps a visually-hidden text node naming the %s callout on the sanitized div',
    (type) => {
      const element = sanitizeCallout(`> [!${type.toUpperCase()}]\n> Body text.`)
      expect(element).toBeDefined()
      expect(element!.properties.ariaLabel).toBeUndefined()

      // remark-rehype's blockquote handler inserts whitespace-only text
      // nodes ("\n") between block-level children, so the sr-only span
      // isn't literally children[0] — find it by tag/class instead. Those
      // whitespace nodes are harmless: browsers collapse them and they
      // don't change reading order for assistive tech.
      const srElement = element!.children.find(
        (child): child is Element =>
          child.type === 'element' &&
          Array.isArray(child.properties.className) &&
          (child.properties.className as string[]).includes('sr-only'),
      )
      expect(srElement).toBeDefined()
      expect(srElement!.tagName).toBe('span')
      const textNode = srElement!.children[0]
      // Real text content, not an attribute — this is what makes the name
      // actually reach a screen reader: it's rendered DOM text, not an
      // aria-* attribute a `generic`-role div is barred from exposing.
      expect(textNode?.type).toBe('text')
      expect(textNode?.type === 'text' ? textNode.value : undefined).toBe(`${type} callout`)
    },
  )

  it('keeps className and data-callout on the sanitized div', () => {
    const element = sanitizeCallout('> [!WARNING]\n> Body text.')
    expect(element!.properties.className).toEqual(['callout', 'callout-warning'])
    expect(element!.properties.dataCallout).toBe('warning')
  })
})
