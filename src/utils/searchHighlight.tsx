/**
 * Search Highlight Utility
 *
 * Provides text highlighting for search result snippets.
 * Wraps matched terms in `<mark>` tags for visual emphasis.
 *
 * Key Responsibilities:
 * - Escape regex special characters in search terms.
 * - Split text by matched terms and render React nodes.
 * - Prioritize longer term matches to avoid partial word highlighting.
 */

import type React from 'react'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Highlights occurrences of search terms within a text string.
 *
 * @param text - The source text to highlight.
 * @param terms - One or more terms to highlight.
 * @returns Array of React nodes with matched terms wrapped in <mark>.
 */
export function highlightText(text: string, terms: string | readonly string[]): React.ReactNode[] {
  const normalized = (Array.isArray(terms) ? terms : [terms])
    .map((term) => term.trim())
    .filter((term) => term.length > 0)

  if (!text || normalized.length === 0) return [text]

  // Deduplicate and sort terms by descending length so longer terms match before shorter substrings.
  const ordered = Array.from(new Set(normalized)).sort((a, b) => b.length - a.length)

  const pattern = ordered.map(escapeRegExp).join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={`${part}-${index}`} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}
