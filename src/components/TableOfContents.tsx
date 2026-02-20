/**
 * Table of Contents Component
 *
 * Dynamically generated sidebar navigation for lesson headings.
 *
 * Key Responsibilities:
 * - Parse H2/H3 headings from content.
 * - Track scroll position to highlight active section.
 * - Smooth scroll to anchors.
 * - Hide if insufficient headings exist.
 */

import { useMemo, useState, useEffect } from 'react'
import { parseHeadings } from '../utils/toc'

interface TableOfContentsProps {
  content: string
}

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
