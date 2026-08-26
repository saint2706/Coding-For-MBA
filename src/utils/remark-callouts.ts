import { visit } from 'unist-util-visit'
import type { Blockquote, Paragraph, Root } from 'mdast'

export type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'danger'

const CALLOUT_MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|DANGER)\]\s*/i

/**
 * Detects GitHub-style alert blockquotes (`> [!NOTE]`, `> [!TIP]`, etc.) and
 * re-tags them as `<div class="callout callout-{type}" data-callout="{type}">`
 * so they render as styled boxes instead of plain pull-quotes. The visible
 * label is added entirely in CSS via the `data-callout` attribute (CSS
 * generated content isn't exposed to assistive tech), so an `aria-label` is
 * set here to give screen reader users the callout type.
 */
export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const firstChild = node.children[0]
      if (!firstChild || firstChild.type !== 'paragraph') return

      const paragraph = firstChild as Paragraph
      const firstInline = paragraph.children[0]
      if (!firstInline || firstInline.type !== 'text') return

      const match = CALLOUT_MARKER.exec(firstInline.value)
      if (!match) return

      const type = match[1]!.toLowerCase() as CalloutType
      firstInline.value = firstInline.value.slice(match[0].length)

      if (firstInline.value === '' && paragraph.children.length === 1) {
        node.children.shift()
      }

      node.data = {
        ...node.data,
        hName: 'div',
        hProperties: {
          className: ['callout', `callout-${type}`],
          dataCallout: type,
          ariaLabel: `${type} callout`,
        },
      }
    })
  }
}
