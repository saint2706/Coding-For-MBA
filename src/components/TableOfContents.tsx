/**
 * TableOfContents Component
 *
 * An automatically generated table of contents from markdown headings
 * with active section highlighting and smooth scrolling.
 */

import { useMemo, useState, useEffect } from 'react'

/**
 * Represents a heading entry in the table of contents.
 *
 * @property id - Generated ID for the heading (used for anchor links)
 * @property text - Display text of the heading
 * @property level - Heading level (2 or 3 for h2/h3)
 */
interface TocEntry {
  id: string
  text: string
  level: number
}

/**
 * Parses markdown content to extract h2 and h3 headings.
 * Skips headings inside code blocks.
 *
 * @param content - Markdown content to parse
 * @returns Array of table of contents entries
 */
function parseHeadings(content: string): TocEntry[] {
  const entries: TocEntry[] = []
  const lines = content.split('\n')
  let inCodeBlock = false

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const text = match[2]!.replace(/[*_`~]/g, '').trim()
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      entries.push({ id, text, level: match[1]!.length })
    }
  }
  return entries
}

/**
 * Props for the TableOfContents component.
 *
 * @property content - Markdown content to generate TOC from
 */
interface TableOfContentsProps {
  content: string
}

/**
 * Automatically generated table of contents component.
 *
 * Features:
 * - Parses h2 and h3 headings from markdown
 * - Highlights currently visible section
 * - Smooth scroll to section on click
 * - Hierarchical indentation for h3 headings
 * - Returns null if fewer than 2 headings
 *
 * @param content - Markdown content to extract headings from
 * @returns A fixed-position table of contents or null
 */
export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => parseHeadings(content), [content])
  const [activeId, setActiveId] = useState<string>('')

  /**
   * Sets up IntersectionObserver to track which heading is currently visible.
   * Updates active ID based on which heading enters the viewport.
   */
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    )

    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <aside className="toc" aria-label="Table of contents">
      <div className="toc-title">On this page</div>
      <nav>
        <ul className="toc-list">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? 'toc-sub' : ''}>
              <a
                href={`#${h.id}`}
                className={`toc-link ${activeId === h.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.getElementById(h.id)
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    setActiveId(h.id)
                  }
                }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
