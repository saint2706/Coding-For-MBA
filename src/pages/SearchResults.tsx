/**
 * Search Results Page
 *
 * Displays search results from the client-side Fuse.js index.
 *
 * Key Responsibilities:
 * - Read query from URL search params.
 * - Execute search and render paginated results.
 * - Highlight matched terms in titles and snippets.
 * - Provide a dedicated search input for refining queries.
 */

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useReducedMotion } from 'motion/react'
import SEOHead from '../components/SEOHead'
import { difficultyConfig } from '../utils/contentLoader'
import Breadcrumb from '../components/Breadcrumb'
import { highlightText } from '../utils/searchHighlight'
import {
  extractMatchedTerms,
  getSearchSnippet,
  search,
  type SearchResult,
} from '../utils/searchIndex'

function SearchEmptyIllustration({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <svg
      className="empty-state-illustration"
      viewBox="0 0 220 130"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="searchEmptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(99,102,241,0.9)" />
          <stop offset="100%" stopColor="rgba(167,139,250,0.75)" />
        </linearGradient>
      </defs>
      <rect x="34" y="36" width="150" height="58" rx="12" fill="rgba(148,163,184,0.12)" />
      <circle
        cx="88"
        cy="65"
        r="15"
        fill="none"
        stroke="url(#searchEmptyGradient)"
        strokeWidth="5"
      />
      <line
        x1="99"
        y1="76"
        x2="118"
        y2="95"
        stroke="url(#searchEmptyGradient)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line x1="129" y1="58" x2="170" y2="58" className={reducedMotion ? '' : 'empty-state-line'} />
      <line x1="129" y1="72" x2="162" y2="72" className={reducedMotion ? '' : 'empty-state-line'} />
      <circle
        cx="174"
        cy="34"
        r="4"
        fill="rgba(99,102,241,0.65)"
        className={reducedMotion ? '' : 'empty-state-dot'}
      />
    </svg>
  )
}

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryFromUrl = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(queryFromUrl)
  const inputRef = useRef<HTMLInputElement>(null)
  const prefersReducedMotion = !!useReducedMotion()

  useEffect(() => {
    setQuery(queryFromUrl)
  }, [queryFromUrl])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null
        if (
          target?.tagName === 'INPUT' ||
          target?.tagName === 'TEXTAREA' ||
          target?.isContentEditable
        )
          return
        event.preventDefault()
        inputRef.current?.focus()
      }

      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        event.preventDefault()
        setQuery('')
        navigate('/search')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  const results: SearchResult[] = useMemo(() => {
    if (query.trim().length < 2) return []
    return search(query, 50)
  }, [query])

  const terms = useMemo(() => extractMatchedTerms(query), [query])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  return (
    <div className="page-container">
      <SEOHead
        title={query ? `Search: ${query}` : 'Search'}
        description="Search the 108-day Coding for MBA curriculum by title, concepts, tags, phase, or content."
        path="/search"
        noIndex
      />

      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />

      <div className="search-page-header">
        <h1>Search lessons</h1>
        <form onSubmit={handleSubmit} className="search-page-form">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="search-page-input"
            placeholder="Search title, concepts, tags, phase, day, and content..."
            aria-label="Search lessons"
          />
          <button type="submit" className="search-page-submit">
            Search
          </button>
        </form>
        {query && (
          <p className="search-page-summary">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {results.length > 0 ? (
        <div className="search-results-list">
          {results.map((result) => {
            const diff =
              difficultyConfig[result.item.difficulty || 'beginner'] ?? difficultyConfig.beginner!

            return (
              <Link
                key={result.item.day}
                to={`/lesson/${result.item.day}`}
                className="search-result-card"
              >
                <div className="search-result-card-header">
                  <span className="search-result-card-day">Day {result.item.day}</span>
                  <h3 className="search-result-card-title">
                    {highlightText(result.item.title, terms)}
                  </h3>
                  <span
                    className="difficulty-badge"
                    style={{ color: diff.color, background: diff.bg }}
                  >
                    {diff.label}
                  </span>
                </div>

                <p className="search-result-card-snippet">
                  {highlightText(getSearchSnippet(result.item.plainContent, query), terms)}
                </p>

                <div className="search-result-card-tags">
                  {(result.item.concepts ?? []).slice(0, 3).map((concept) => (
                    <span key={concept} className="search-result-tag">
                      {highlightText(concept, terms)}
                    </span>
                  ))}
                  {(result.item.tags ?? []).slice(0, 3).map((tag) => (
                    <span key={tag} className="search-result-tag">
                      {highlightText(tag, terms)}
                    </span>
                  ))}
                </div>
                <span className="search-result-card-phase">Phase {result.item.phase}</span>
              </Link>
            )
          })}
        </div>
      ) : query.trim().length >= 2 ? (
        <div className="search-empty-page glass-card">
          <SearchEmptyIllustration reducedMotion={prefersReducedMotion} />
          <p>No lessons matched your search.</p>
          <p>Try broader or different keywords.</p>
        </div>
      ) : (
        <div className="search-empty-page glass-card">
          <SearchEmptyIllustration reducedMotion={prefersReducedMotion} />
          <p>Type at least 2 characters to search.</p>
          <p>Shortcut: press "/" to focus this box and Esc to clear.</p>
        </div>
      )}
    </div>
  )
}
