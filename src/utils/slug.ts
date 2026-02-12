import { isValidElement, type ReactNode } from 'react'

function normalizeForSlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/[\s-]+/g, '-')
}

export function stripMarkdownInlineFormatting(value: string): string {
  return value
    .replace(/\s+#+\s*$/, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/\\([\\`*_[\]{}()#+\-.!])/g, '$1')
    .trim()
}

export function extractTextFromReactNode(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map((child) => extractTextFromReactNode(child)).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractTextFromReactNode(node.props.children)
  }
  return ''
}

export function createSlugger() {
  const counts = new Map<string, number>()

  return {
    slug(value: string): string {
      const base = normalizeForSlug(value) || 'section'
      const count = counts.get(base) ?? 0
      counts.set(base, count + 1)
      return count === 0 ? base : `${base}-${count}`
    },
  }
}
