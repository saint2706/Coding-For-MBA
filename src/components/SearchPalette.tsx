/**
 * SearchPalette Component
 *
 * A command palette-style search interface for quickly finding lessons
 * by title, content, tags, or concepts — and for running quick actions
 * (navigation, reading mode, mark-complete, keyboard shortcuts) when the
 * query is empty.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MagnifyingGlass,
  X,
  Compass,
  BookOpen,
  CheckCircle,
  Keyboard,
  type Icon,
} from '@phosphor-icons/react'
import {
  getSearchSnippet,
  getSearchIndexStatus,
  search,
  subscribeSearchIndexStatus,
  type SearchResult,
} from '../utils/searchIndex'
import { difficultyConfig } from '../utils/contentLoader'
import { useDebounce } from '../hooks/useDebounce'
import { useUserPreferencesStore } from '../stores/userPreferencesStore'
import { useProgressStore } from '../stores/progressStore'
import { toastSuccess } from '../utils/toast'
import { completeLesson } from '../utils/completeLesson'

/**
 * Props for the SearchPalette component.
 *
 * @property isOpen - Whether the search palette is visible
 * @property onClose - Callback to close the search palette
 * @property onOpenShortcuts - Callback to open the keyboard shortcuts overlay
 */
interface SearchPaletteProps {
  isOpen: boolean
  onClose: () => void
  onOpenShortcuts: () => void
}

/**
 * A single quick action shown in the palette when the query is empty.
 */
interface QuickAction {
  id: string
  label: string
  hint?: string
  icon: Icon
  onRun: () => void
}

/** Matches `/lesson/:dayNum` and captures the raw day token. */
const LESSON_PATH_PATTERN = /^\/lesson\/([^/]+)\/?$/

/** Same focus-trap selector used by KeyboardShortcutsOverlay. */
const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Command palette search interface.
 *
 * Features:
 * - Quick actions (navigation, reading mode, mark-complete, shortcuts) when the query is empty
 * - Fuzzy search across lesson titles, content, and tags once the user types
 * - Keyboard navigation (arrow keys, enter, escape) unified across both lists
 * - Debounced search input
 * - Result highlighting and snippets
 * - Click or keyboard selection to navigate or run an action
 * - Modal overlay with click-outside to close
 *
 * @param isOpen - Controls visibility of the search palette
 * @param onClose - Function to close the palette
 * @param onOpenShortcuts - Function to open the keyboard shortcuts overlay
 * @returns A modal search interface
 */
export default function SearchPalette({ isOpen, onClose, onOpenShortcuts }: SearchPaletteProps) {
  const [query, setQuery] = useState('')

  // Memoize the reset condition to avoid unnecessary re-runs of useDebounce
  const shouldResetImmediately = useCallback((q: string) => q.trim().length < 2, [])

  const debouncedQuery = useDebounce(query, 300, shouldResetImmediately)
  const [activeIndex, setActiveIndex] = useState(0)
  const [indexStatus, setIndexStatus] = useState(getSearchIndexStatus)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const paletteRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const readingMode = useUserPreferencesStore((state) => state.readingMode)
  const completedLessons = useProgressStore((state) => state.completedLessons)

  const isEmptyQuery = query.trim().length === 0

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
   * Traps Tab focus within the palette while open, and restores focus to
   * whatever had it beforehand once the palette closes — same idiom as
   * `KeyboardShortcutsOverlay`.
   */
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const priorFocus = document.activeElement as HTMLElement | null

    const handleOpenKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !paletteRef.current) {
        return
      }

      const focusables = Array.from(
        paletteRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      )
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleOpenKeyDown)
    return () => {
      window.removeEventListener('keydown', handleOpenKeyDown)
      priorFocus?.focus()
    }
  }, [isOpen, onClose])

  /**
   * Computes search results from debounced query.
   */
  const results: SearchResult[] = useMemo(() => {
    const trimmed = debouncedQuery.trim()
    if (trimmed.length < 2) return []
    return search(trimmed, 10)
  }, [debouncedQuery])

  /**
   * Builds the quick-actions list shown when the query is empty: navigation
   * shortcuts, a reading-mode toggle, mark-current-lesson-complete (only on
   * a lesson page that isn't already complete), and opening the keyboard
   * shortcuts overlay. Depends on `readingMode`/`completedLessons` (read via
   * hook selectors so labels/visibility stay fresh) but mutates through
   * `getState()` at run-time so each action always acts on the latest state.
   */
  const quickActions: QuickAction[] = useMemo(() => {
    const actions: QuickAction[] = [
      {
        id: 'goto-curriculum',
        label: 'Go to Curriculum',
        hint: '↵',
        icon: Compass,
        onRun: () => {
          onClose()
          navigate('/curriculum')
        },
      },
      {
        id: 'goto-progress',
        label: 'Go to Progress',
        hint: '↵',
        icon: Compass,
        onRun: () => {
          onClose()
          navigate('/progress')
        },
      },
      {
        id: 'goto-exercises',
        label: 'Go to Exercises',
        hint: '↵',
        icon: Compass,
        onRun: () => {
          onClose()
          navigate('/exercises')
        },
      },
      {
        id: 'goto-settings',
        label: 'Go to Settings',
        hint: '↵',
        icon: Compass,
        onRun: () => {
          onClose()
          navigate('/settings')
        },
      },
      {
        id: 'toggle-reading-mode',
        label: readingMode ? 'Turn reading mode off' : 'Turn reading mode on',
        hint: '↵',
        icon: BookOpen,
        onRun: () => {
          const prefs = useUserPreferencesStore.getState()
          prefs.setReadingMode(!prefs.readingMode)
          onClose()
        },
      },
    ]

    const lessonDay = location.pathname.match(LESSON_PATH_PATTERN)?.[1]
    if (lessonDay && !useProgressStore.getState().isLessonComplete(lessonDay)) {
      actions.push({
        id: 'mark-lesson-complete',
        label: `Mark Day ${lessonDay} complete`,
        hint: '↵',
        icon: CheckCircle,
        onRun: () => {
          completeLesson(lessonDay)
          onClose()
          toastSuccess(`Day ${lessonDay} marked complete`)
        },
      })
    }

    actions.push({
      id: 'open-shortcuts',
      label: 'Open keyboard shortcuts',
      hint: '↵',
      icon: Keyboard,
      onRun: () => {
        onClose()
        onOpenShortcuts()
      },
    })

    return actions
    // `completedLessons` isn't read directly — it's included so this list
    // recomputes (and "Mark Day N complete" disappears) once the lesson is
    // marked complete, since the visibility check below reads the store snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingMode, completedLessons, location.pathname, navigate, onClose, onOpenShortcuts])

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

  /** Number of entries in whichever list (quick actions or results) is active. */
  const activeListLength = isEmptyQuery ? quickActions.length : results.length

  /** Runs whichever entry — quick action or search result — is at `index`. */
  const activateIndex = useCallback(
    (index: number) => {
      if (isEmptyQuery) {
        quickActions[index]?.onRun()
      } else {
        const result = results[index]
        if (result) navigateToResult(result)
      }
    },
    [isEmptyQuery, quickActions, results, navigateToResult],
  )

  /**
   * Handles keyboard navigation within the search palette. Operates over a
   * single `activeIndex` shared by quick actions and search results, so
   * arrow keys/Enter behave identically regardless of which list is shown.
   * Escape is handled separately by the focus-trap effect's window-level
   * listener (so it works no matter which focusable element is active, not
   * just the input), so it isn't duplicated here.
   *
   * @param e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, activeListLength - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        activateIndex(activeIndex)
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

  const renderedQuickActions = useMemo(() => {
    return quickActions.map((action, index) => {
      const ActionIcon = action.icon
      return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus -- this is an aria-activedescendant listbox: keyboard activation runs through the input's onKeyDown (case 'Enter' -> activateIndex) below, not a per-option handler; the option itself is deliberately not a separate tab stop.
        <div
          key={action.id}
          id={`search-result-${index}`}
          className={`search-result-item search-action-item ${index === activeIndex ? 'active' : ''}`}
          onClick={() => action.onRun()}
          role="option"
          aria-selected={index === activeIndex}
        >
          <ActionIcon className="search-action-icon" aria-hidden="true" />
          <span className="search-action-label">{action.label}</span>
          {action.hint && <kbd className="search-action-hint">{action.hint}</kbd>}
        </div>
      )
    })
  }, [quickActions, activeIndex])

  // ⚡ Bolt: Memoize the search results mapping to prevent recalculation
  // on every keystroke when debouncedQuery hasn't updated yet.
  const renderedResults = useMemo(() => {
    return results.map((result, index) => {
      const diff =
        difficultyConfig[result.item.difficulty || 'beginner'] || difficultyConfig.beginner!
      return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus -- this is an aria-activedescendant listbox: keyboard activation runs through the input's onKeyDown (case 'Enter' -> activateIndex) below, not a per-option handler; the option itself is deliberately not a separate tab stop.
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
    <div
      className="search-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        ref={paletteRef}
        className="search-palette"
        role="dialog"
        aria-label="Search lessons"
        aria-modal="true"
      >
        <div className="search-input-wrapper">
          <MagnifyingGlass className="search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            className="search-input"
            placeholder="Search lessons, topics, concepts…"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={activeListLength > 0}
            aria-controls="search-results"
            aria-activedescendant={
              activeListLength > 0 ? `search-result-${activeIndex}` : undefined
            }
          />
          <kbd className="search-kbd">ESC</kbd>
          <button
            type="button"
            className="search-close-btn"
            onClick={onClose}
            aria-label="Close search"
          >
            <X weight="bold" aria-hidden="true" />
          </button>
        </div>

        {isEmptyQuery && quickActions.length > 0 && (
          <div
            className="search-results"
            id="search-results"
            ref={listRef}
            role="listbox"
            aria-label="Quick actions"
          >
            {renderedQuickActions}
          </div>
        )}

        {!isEmptyQuery && results.length > 0 && (
          <div
            className="search-results"
            id="search-results"
            ref={listRef}
            role="listbox"
            aria-label="Search results"
          >
            {renderedResults}
          </div>
        )}

        {!isEmptyQuery &&
          debouncedQuery.trim().length >= 2 &&
          results.length === 0 &&
          !indexStatus.isReady && (
            <div className="search-empty">
              <p>
                Indexing lessons… ({indexStatus.processedCount}/{indexStatus.totalCount})
              </p>
            </div>
          )}

        {!isEmptyQuery &&
          debouncedQuery.trim().length >= 2 &&
          results.length === 0 &&
          indexStatus.isReady && (
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
            <kbd>↵</kbd> {isEmptyQuery ? 'Run' : 'Open'}
          </span>
          <span>
            <kbd>ESC</kbd> Close
          </span>
        </div>
      </div>
    </div>
  )
}
