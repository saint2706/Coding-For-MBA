import { visit } from 'unist-util-visit'
import { createSlugger } from './slug'
import type { Element, Root } from 'hast'

function toString(node: any): string {
  if (typeof node.value === 'string') return node.value
  if (Array.isArray(node.children)) {
    return node.children.map(toString).join('')
  }
  return ''
}

/**
 * A rehype plugin to add custom slugs to heading elements.
 * Iterates over 'h1', 'h2', and 'h3' tags in the AST and assigns a slugified `id` property.
 *
 * @returns {(tree: Root) => void} A transformer function for the rehype AST.
 */
export function rehypeSlugCustom() {
  return (tree: Root) => {
    const slugger = createSlugger()
    visit(tree, 'element', (node: Element) => {
      if (['h1', 'h2', 'h3'].includes(node.tagName)) {
        const text = toString(node)
        const id = slugger.slug(text)
        if (!node.properties) node.properties = {}
        node.properties.id = id
      }
    })
  }
}
