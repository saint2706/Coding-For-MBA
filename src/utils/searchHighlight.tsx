import type React from 'react'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function highlightText(text: string, terms: string | readonly string[]): React.ReactNode[] {
  const normalized = (Array.isArray(terms) ? terms : [terms])
    .map((term) => term.trim())
    .filter((term) => term.length > 0)

  if (!text || normalized.length === 0) return [text]

  const pattern = normalized.map(escapeRegExp).join('|')
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
