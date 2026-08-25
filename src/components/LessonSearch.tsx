/**
 * Lesson Search
 *
 * In-page "/" search scoped to the current lesson: highlights matches inside
 * the rendered article and lets the reader jump between them with
 * Enter/Shift+Enter or the prev/next buttons.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type RefObject,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { isTypingInEditableElement } from '../utils/shortcuts'

const MATCH_CLASS = 'lesson-search-match'
const ACTIVE_MATCH_CLASS = 'lesson-search-match-active'
const MIN_QUERY_LENGTH = 2

function clearHighlights(container: HTMLElement) {
  const marks = container.querySelectorAll(`mark.${MATCH_CLASS}`)
  marks.forEach((mark) => {
    mark.replaceWith(document.createTextNode(mark.textContent || ''))
  })
  container.normalize()
}

/** Wraps every occurrence of `query` found within a single text node in a `<mark>`. */
function highlightMatches(container: HTMLElement, query: string): HTMLElement[] {
  const lowerQuery = query.toLowerCase()
  const marks: HTMLElement[] = []

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parentTag = node.parentElement?.tagName
      if (parentTag === 'SCRIPT' || parentTag === 'STYLE') return NodeFilter.FILTER_REJECT
      return node.nodeValue ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    },
  })

  const textNodes: Text[] = []
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    textNodes.push(node as Text)
  }

  for (const node of textNodes) {
    const text = node.nodeValue || ''
    const lowerText = text.toLowerCase()
    let matchIndex = lowerText.indexOf(lowerQuery)
    if (matchIndex === -1) continue

    const fragment = document.createDocumentFragment()
    let cursor = 0
    while (matchIndex !== -1) {
      if (matchIndex > cursor) {
        fragment.appendChild(document.createTextNode(text.slice(cursor, matchIndex)))
      }
      const mark = document.createElement('mark')
      mark.className = MATCH_CLASS
      mark.textContent = text.slice(matchIndex, matchIndex + query.length)
      fragment.appendChild(mark)
      marks.push(mark)
      cursor = matchIndex + query.length
      matchIndex = lowerText.indexOf(lowerQuery, cursor)
    }
    if (cursor < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(cursor)))
    }
    node.replaceWith(fragment)
  }

  return marks
}

interface LessonSearchProps {
  /** The lesson article container to search within. */
  containerRef: RefObject<HTMLElement | null>
}

export default function LessonSearch({ containerRef }: LessonSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const matchesRef = useRef<HTMLElement[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const closeSearch = useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [])

  // "/" opens the search bar; the navbar's global "/" shortcut steps aside on lesson pages.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (isTypingInEditableElement(event.target)) return
        event.preventDefault()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  // Rebuild highlights whenever the query (or open state) changes.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    clearHighlights(container)

    const trimmed = query.trim()
    if (!isOpen || trimmed.length < MIN_QUERY_LENGTH) {
      matchesRef.current = []
      setMatchCount(0)
      setActiveIndex(0)
      return
    }

    const marks = highlightMatches(container, trimmed)
    matchesRef.current = marks
    setMatchCount(marks.length)
    setActiveIndex(0)
  }, [query, isOpen, containerRef])

  // Mark the active match and scroll it into view.
  useEffect(() => {
    matchesRef.current.forEach((mark, i) => {
      mark.classList.toggle(ACTIVE_MATCH_CLASS, i === activeIndex)
    })
    matchesRef.current[activeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIndex, matchCount])

  // Clear any leftover highlights when the search bar closes or unmounts.
  useEffect(() => {
    if (isOpen) return
    const container = containerRef.current
    if (container) clearHighlights(container)
  }, [isOpen, containerRef])

  useEffect(() => {
    return () => {
      const container = containerRef.current
      if (container) clearHighlights(container)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (matchCount === 0 ? 0 : (prev + 1) % matchCount))
  }, [matchCount])

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (matchCount === 0 ? 0 : (prev - 1 + matchCount) % matchCount))
  }, [matchCount])

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (event.shiftKey) goToPrev()
      else goToNext()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      closeSearch()
    }
  }

  if (!isOpen) return null

  const showCount = query.trim().length >= MIN_QUERY_LENGTH

  return (
    <div className="lesson-search-bar" role="search" aria-label="Search this lesson">
      <MagnifyingGlass className="lesson-search-icon" aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder="Search this lesson…"
        className="lesson-search-input"
        aria-label="Search this lesson"
      />
      <span className="lesson-search-count" aria-live="polite">
        {showCount ? `${matchCount === 0 ? 0 : activeIndex + 1}/${matchCount}` : ''}
      </span>
      <button
        type="button"
        className="lesson-search-nav-btn"
        onClick={goToPrev}
        disabled={matchCount === 0}
        aria-label="Previous match"
      >
        ↑
      </button>
      <button
        type="button"
        className="lesson-search-nav-btn"
        onClick={goToNext}
        disabled={matchCount === 0}
        aria-label="Next match"
      >
        ↓
      </button>
      <button
        type="button"
        className="lesson-search-close-btn"
        onClick={closeSearch}
        aria-label="Close search"
      >
        ✕
      </button>
    </div>
  )
}
