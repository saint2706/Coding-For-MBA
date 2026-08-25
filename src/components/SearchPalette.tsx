/**
 * SearchPalette Component
 *
 * A command palette-style search interface for quickly finding lessons
 * by title, content, tags, or concepts.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import {
  getSearchSnippet,
  getSearchIndexStatus,
  search,
  subscribeSearchIndexStatus,
  type SearchResult,
} from '../utils/searchIndex'
import { difficultyConfig } from '../utils/contentLoader'
import { useDebounce } from '../hooks/useDebounce'

/**
 * Props for the SearchPalette component.
 *
 * @property isOpen - Whether the search palette is visible
 * @property onClose - Callback to close the search palette
 */
interface SearchPaletteProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Command palette search interface.
 *
 * Features:
 * - Fuzzy search across lesson titles, content, and tags
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Debounced search input
 * - Result highlighting and snippets
 * - Click or keyboard selection to navigate
 * - Modal overlay with click-outside to close
 *
 * @param isOpen - Controls visibility of the search palette
 * @param onClose - Function to close the palette
 * @returns A modal search interface
 */
export default function SearchPalette({ isOpen, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('')

  // Memoize the reset condition to avoid unnecessary re-runs of useDebounce
  const shouldResetImmediately = useCallback((q: string) => q.trim().length < 2, [])

  const debouncedQuery = useDebounce(query, 300, shouldResetImmediately)
  const [activeIndex, setActiveIndex] = useState(0)
  const [indexStatus, setIndexStatus] = useState(getSearchIndexStatus)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  /**
   * Resets search state and focuses input when palette opens.
   */
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isOpen])

  /**
   * Computes search results from debounced query.
   */
  const results: SearchResult[] = useMemo(() => {
    const trimmed = debouncedQuery.trim()
    if (trimmed.length < 2) return []
    return search(trimmed, 10)
  }, [debouncedQuery])

  /**
   * Scrolls active result item into view when selection changes.
   */
  useEffect(() => {
    return subscribeSearchIndexStatus(setIndexStatus)
  }, [])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const active = list.children[activeIndex] as HTMLElement | undefined
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  /**
   * Updates query and resets active index.
   */
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setActiveIndex(0)
  }

  /**
   * Navigates to a search result and closes the palette.
   *
   * @param result - The search result to navigate to
   */
  const navigateToResult = useCallback(
    (result: SearchResult) => {
      onClose()
      navigate(`/lesson/${result.item.day}`)
    },
    [navigate, onClose],
  )

  /**
   * Handles keyboard navigation within the search palette.
   *
   * @param e - Keyboard event
   */
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

  /**
   * Extracts and formats a snippet from the search result around the first match.
   *
   * @param result - Search result to extract snippet from
   * @returns Formatted text snippet with ellipses
   */
  const getSnippet = useCallback(
    (result: SearchResult): string => {
      const plain = result.item.plainContent || result.item.content
      return getSearchSnippet(plain, debouncedQuery, 120)
    },
    [debouncedQuery],
  )

  // ⚡ Bolt: Memoize the search results mapping to prevent recalculation
  // on every keystroke when debouncedQuery hasn't updated yet.
  const renderedResults = useMemo(() => {
    return results.map((result, index) => {
      const diff =
        difficultyConfig[result.item.difficulty || 'beginner'] || difficultyConfig.beginner!
      return (
        <div
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
        </div>
      )
    })
  }, [results, activeIndex, navigateToResult, getSnippet])

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
          <MagnifyingGlass className="search-icon" aria-hidden="true" />
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
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-activedescendant={results.length > 0 ? `search-result-${activeIndex}` : undefined}
          />
          <kbd className="search-kbd">ESC</kbd>
          <button
            type="button"
            className="search-close-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            onClick={onClose}
            aria-label="Close search"
          >
            <X weight="bold" aria-hidden="true" />
          </button>
        </div>

        {results.length > 0 && (
          <div className="search-results" id="search-results" ref={listRef} role="listbox">
            {renderedResults}
          </div>
        )}

        {debouncedQuery.trim().length >= 2 && results.length === 0 && !indexStatus.isReady && (
          <div className="search-empty">
            <p>
              Indexing lessons… ({indexStatus.processedCount}/{indexStatus.totalCount})
            </p>
          </div>
        )}

        {debouncedQuery.trim().length >= 2 && results.length === 0 && indexStatus.isReady && (
          <div className="search-empty">
            <MagnifyingGlass className="search-empty-icon" aria-hidden="true" />
            <p>No results found for &ldquo;{debouncedQuery}&rdquo;</p>
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
