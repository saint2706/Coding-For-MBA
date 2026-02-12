import type React from 'react'

/**
 * Highlights matching text segments within a string.
 *
 * Wraps matching portions of text in <mark> elements for visual highlighting.
 * Uses case-insensitive matching and escapes special regex characters.
 */
export function highlightText(text: string, query: string): React.ReactNode[] {
  if (!query.trim()) return [text]
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}
