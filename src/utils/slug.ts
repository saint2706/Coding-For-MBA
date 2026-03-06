/**
 * Slug Generation Utilities
 *
 * Provides functions for generating URL-safe slugs from text and React nodes.
 * Used for anchor links, IDs, and URL paths.
 *
 * Key Responsibilities:
 * - Normalize text (remove accents, lowercase, sanitize).
 * - Extract plain text from React component trees.
 * - Manage slug uniqueness (deduplication).
 */

import { isValidElement, type ReactNode } from 'react'

/**
 * Normalizes a string for use as a URL slug.
 * Removes accents, special characters, and converts to lowercase.
 *
 * @param value - The input string.
 * @returns A URL-safe slug string.
 */
function normalizeForSlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/[\s-]+/g, '-')
}

/**
 * Removes common inline Markdown formatting from a string.
 *
 * @param value - The input markdown string.
 * @returns The plain text string without formatting.
 */
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

/**
 * Recursively extracts plain text from a React node tree.
 *
 * @param node - The React node to extract text from.
 * @returns The concatenated plain text string.
 */
export function extractTextFromReactNode(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map((child) => extractTextFromReactNode(child)).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractTextFromReactNode(node.props.children)
  }
  return ''
}

/**
 * Creates a stateful slug generator that ensures unique slugs.
 *
 * @returns An object with a `slug` method.
 */
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
