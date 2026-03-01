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

import { useMemo, useState, useEffect, useId, type MouseEvent } from 'react'
import { parseHeadings } from '../utils/toc'

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => parseHeadings(content), [content])
  const [activeId, setActiveId] = useState<string>('')
  const [isCompact, setIsCompact] = useState(false)
  const [isCompactOpen, setIsCompactOpen] = useState(false)
  const tocListId = useId()

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

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(max-width: 1200px)')
    const syncCompact = () => {
      const nextCompactState = mediaQuery.matches
      setIsCompact(nextCompactState)

      if (!nextCompactState) {
        setIsCompactOpen(false)
      }
    }

    syncCompact()
    mediaQuery.addEventListener('change', syncCompact)

    return () => mediaQuery.removeEventListener('change', syncCompact)
  }, [])

  useEffect(() => {
    if (!isCompactOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCompactOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isCompactOpen])

  const handleHeadingClick = (event: MouseEvent<HTMLAnchorElement>, headingId: string) => {
    event.preventDefault()
    const el = document.getElementById(headingId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      el.focus({ preventScroll: true })
      setActiveId(headingId)
      setIsCompactOpen(false)
    }
  }

  if (headings.length < 2) return null

  return (
    <aside className={`toc ${isCompact ? 'toc-compact' : ''}`} aria-label="Table of contents">
      <div className="toc-title">On this page</div>
      {isCompact && (
        <button
          type="button"
          className="toc-toggle"
          aria-expanded={isCompactOpen}
          aria-controls={tocListId}
          title={isCompactOpen ? 'Collapse table of contents' : 'Expand table of contents'}
          onClick={() => setIsCompactOpen((prev) => !prev)}
        >
          <span>Jump to section</span>
          <span aria-hidden="true" className={`toc-toggle-chevron ${isCompactOpen ? 'open' : ''}`}>
            ▾
          </span>
        </button>
      )}
      <nav id={tocListId} className={isCompact ? `toc-panel ${isCompactOpen ? 'open' : ''}` : ''}>
        <ul
          className="toc-list"
          onKeyDown={(event) => event.key === 'Escape' && setIsCompactOpen(false)}
        >
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? 'toc-sub' : ''}>
              <a
                href={`#${h.id}`}
                className={`toc-link ${activeId === h.id ? 'active' : ''}`}
                onClick={(event) => handleHeadingClick(event, h.id)}
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
