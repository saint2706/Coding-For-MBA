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
import { SearchEmptyIllustration } from '../components/EmptyStateIllustrations'
import SEOHead from '../components/SEOHead'
import { difficultyConfig } from '../utils/contentLoader'
import Breadcrumb from '../components/Breadcrumb'
import { useDebounce } from '../hooks/useDebounce'
import { highlightText } from '../utils/searchHighlight'
import {
  extractMatchedTerms,
  getSearchSnippet,
  search,
  type SearchResult,
} from '../utils/searchIndex'
import { semanticSearch, type SemanticResult } from '../utils/semanticSearch'
import { isGeminiAvailable } from '../utils/geminiClient'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryFromUrl = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(queryFromUrl)
  const debouncedQuery = useDebounce(query, 250, (value) => value.trim() === '')
  const inputRef = useRef<HTMLInputElement>(null)
  const [isSemanticMode, setIsSemanticMode] = useState(false)
  const [semanticResults, setSemanticResults] = useState<SemanticResult[]>([])
  const [semanticFallbackResults, setSemanticFallbackResults] = useState<SearchResult[]>([])
  const [semanticLoading, setSemanticLoading] = useState(false)
  const [semanticError, setSemanticError] = useState<string | null>(null)

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
    if (debouncedQuery.trim().length < 2) return []
    return search(debouncedQuery, 50)
  }, [debouncedQuery])

  const terms = useMemo(() => extractMatchedTerms(debouncedQuery), [debouncedQuery])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  // Semantic search effect
  useEffect(() => {
    if (!isSemanticMode || debouncedQuery.trim().length < 2) {
      setSemanticResults([])
      setSemanticFallbackResults([])
      setSemanticError(null)
      return
    }
    let cancelled = false
    setSemanticLoading(true)
    setSemanticError(null)
    semanticSearch(debouncedQuery, 15)
      .then((res) => {
        if (!cancelled) {
          setSemanticResults(res)
          setSemanticFallbackResults([])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSemanticResults([])
          setSemanticFallbackResults(search(debouncedQuery, 50))
          setSemanticError('AI search is temporarily unavailable. Showing keyword results instead.')
        }
      })
      .finally(() => {
        if (!cancelled) setSemanticLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isSemanticMode, debouncedQuery])

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          {query && (
            <p className="search-page-summary">
              {isSemanticMode
                ? semanticLoading
                  ? 'Searching with AI...'
                  : `${semanticResults.length} semantic result${semanticResults.length !== 1 ? 's' : ''} for \u201c${query}\u201d`
                : `${results.length} result${results.length !== 1 ? 's' : ''} for \u201c${query}\u201d`}
            </p>
          )}
          {isGeminiAvailable() && (
            <button
              className={`semantic-search-toggle ${isSemanticMode ? 'active' : ''}`}
              onClick={() => setIsSemanticMode((prev) => !prev)}
              type="button"
            >
              \u2728 {isSemanticMode ? 'AI Search ON' : 'AI Search'}
            </button>
          )}
        </div>
        {semanticError && (
          <p role="status" className="search-semantic-error" style={{ marginTop: '0.5rem' }}>
            {semanticError}
          </p>
        )}
      </div>

      {isSemanticMode && semanticResults.length > 0 ? (
        <div className="search-results-list">
          {semanticResults.map((result) => {
            const diff =
              difficultyConfig[result.lesson.difficulty || 'beginner'] ?? difficultyConfig.beginner!
            return (
              <Link
                key={result.lesson.day}
                to={`/lesson/${result.lesson.day}`}
                className="search-result-card"
              >
                <div className="search-result-card-header">
                  <span className="search-result-card-day">Day {result.lesson.day}</span>
                  <h3 className="search-result-card-title">{result.lesson.title}</h3>
                  <span className="semantic-score">{(result.score * 100).toFixed(0)}%</span>
                  <span
                    className="difficulty-badge"
                    style={{ color: diff.color, background: diff.bg }}
                  >
                    {diff.label}
                  </span>
                </div>
                <span className="search-result-card-phase">Phase {result.lesson.phase}</span>
              </Link>
            )
          })}
        </div>
      ) : isSemanticMode && semanticFallbackResults.length > 0 ? (
        <div className="search-results-list">
          {semanticFallbackResults.map((result) => {
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
                  {highlightText(getSearchSnippet(result.item.plainContent, debouncedQuery), terms)}
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
      ) : !isSemanticMode && results.length > 0 ? (
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
                  {highlightText(getSearchSnippet(result.item.plainContent, debouncedQuery), terms)}
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
      ) : debouncedQuery.trim().length >= 2 ? (
        <div className="search-empty-page glass-card">
          <SearchEmptyIllustration />
          <p>No lessons matched your search.</p>
          <p>Try broader or different keywords.</p>
        </div>
      ) : (
        <div className="search-empty-page glass-card">
          <SearchEmptyIllustration />
          <p>Type at least 2 characters to search.</p>
          <p>Shortcut: press "/" to focus this box and Esc to clear.</p>
        </div>
      )}
    </div>
  )
}
