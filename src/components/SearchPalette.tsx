import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { search, type SearchResult } from '../utils/searchIndex'
import { difficultyConfig } from '../utils/contentLoader'

interface SearchPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchPalette({ isOpen, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Reset state and focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reset on open
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isOpen])

  // Compute search results from query (derived state via useMemo)
  const results: SearchResult[] = useMemo(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) return []
    return search(trimmed, 10)
  }, [query])

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const active = list.children[activeIndex] as HTMLElement | undefined
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setActiveIndex(0)
  }

  const navigateToResult = useCallback(
    (result: SearchResult) => {
      onClose()
      navigate(`/lesson/${result.item.day}`)
    },
    [navigate, onClose],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[activeIndex]) {
          navigateToResult(results[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  // Get a text snippet around the first match in body content
  function getSnippet(result: SearchResult): string {
    const contentMatch = result.matches?.find((m) => m.key === 'plainContent')
    if (!contentMatch) {
      // Fall back to first 120 chars of content
      const plain =
        (result.item as unknown as { plainContent?: string }).plainContent || result.item.content
      return plain.slice(0, 120).trim() + '…'
    }

    const text = contentMatch.value || ''
    const firstIndex = contentMatch.indices?.[0]
    if (!firstIndex) return text.slice(0, 120).trim() + '…'

    const start = Math.max(0, firstIndex[0] - 40)
    const end = Math.min(text.length, firstIndex[1] + 80)
    let snippet = text.slice(start, end).trim()
    if (start > 0) snippet = '…' + snippet
    if (end < text.length) snippet = snippet + '…'
    return snippet
  }

  if (!isOpen) return null

  return (
    <div className="search-overlay" onClick={onClose} role="presentation">
      <div
        className="search-palette"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Search lessons"
        aria-modal="true"
      >
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search lessons, topics, concepts…"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-activedescendant={results.length > 0 ? `search-result-${activeIndex}` : undefined}
          />
          <kbd className="search-kbd">ESC</kbd>
        </div>

        {results.length > 0 && (
          <div className="search-results" id="search-results" ref={listRef} role="listbox">
            {results.map((result, index) => {
              const diff =
                difficultyConfig[result.item.difficulty || 'beginner'] || difficultyConfig.beginner!
              return (
                <button
                  key={result.item.day}
                  id={`search-result-${index}`}
                  className={`search-result-item ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => navigateToResult(result)}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <div className="search-result-header">
                    <span className="search-result-day">Day {result.item.day}</span>
                    <span className="search-result-title">{result.item.title}</span>
                    <span
                      className="search-result-badge"
                      style={{ color: diff.color, background: diff.bg }}
                    >
                      {diff.label}
                    </span>
                  </div>
                  <div className="search-result-snippet">{getSnippet(result)}</div>
                  {result.item.tags && result.item.tags.length > 0 && (
                    <div className="search-result-tags">
                      {result.item.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="search-result-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {query.trim().length >= 2 && results.length === 0 && (
          <div className="search-empty">
            <p>No results found for &ldquo;{query}&rdquo;</p>
          </div>
        )}

        <div className="search-footer">
          <span>
            <kbd>↑↓</kbd> Navigate
          </span>
          <span>
            <kbd>↵</kbd> Open
          </span>
          <span>
            <kbd>ESC</kbd> Close
          </span>
        </div>
      </div>
    </div>
  )
}
