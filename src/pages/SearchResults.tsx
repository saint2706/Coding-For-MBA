import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import { search, type SearchResult } from '../utils/searchIndex'
import { difficultyConfig } from '../utils/contentLoader'
import Breadcrumb from '../components/Breadcrumb'

// Highlight matching text segments in a string
function highlightText(text: string, query: string): React.ReactNode[] {
  if (!query.trim()) return [text]
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

// Extract snippet around matching area in body content
function getContentSnippet(result: SearchResult, query: string): string {
  const content = result.item.plainContent || result.item.content
  const lowerContent = content.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const matchIndex = lowerContent.indexOf(lowerQuery)

  if (matchIndex === -1) return content.slice(0, 200).trim() + '…'

  const start = Math.max(0, matchIndex - 80)
  const end = Math.min(content.length, matchIndex + query.length + 120)
  let snippet = content.slice(start, end).trim()
  if (start > 0) snippet = '…' + snippet
  if (end < content.length) snippet = snippet + '…'
  return snippet
}

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const queryParam = searchParams.get('q') || ''
  const [query, setQuery] = useState(queryParam)

  // Sync from URL param
  useEffect(() => {
    setQuery(queryParam)
  }, [queryParam])

  const results: SearchResult[] = useMemo(
    () => (query.trim().length >= 2 ? search(query, 50) : []),
    [query],
  )

  return (
    <div className="page-container">
      <Helmet>
        <title>{query ? `Search: ${query}` : 'Search'} — Coding for MBA</title>
      </Helmet>

      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Search Results' }]} />

      <div className="search-page-header">
        <h1>Search Results</h1>
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
              difficultyConfig[result.item.difficulty || 'beginner'] || difficultyConfig.beginner!
            const snippet = getContentSnippet(result, query)

            return (
              <Link
                key={result.item.day}
                to={`/lesson/${result.item.day}`}
                className="search-result-card"
              >
                <div className="search-result-card-header">
                  <span className="search-result-card-day">Day {result.item.day}</span>
                  <h3 className="search-result-card-title">
                    {highlightText(result.item.title, query)}
                  </h3>
                  <span
                    className="difficulty-badge"
                    style={{ color: diff.color, background: diff.bg }}
                  >
                    {diff.label}
                  </span>
                </div>
                <p className="search-result-card-snippet">{highlightText(snippet, query)}</p>
                {result.item.tags && result.item.tags.length > 0 && (
                  <div className="search-result-card-tags">
                    {result.item.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`search-result-tag ${tag.toLowerCase().includes(query.toLowerCase()) ? 'matched' : ''}`}
                      >
                        {highlightText(tag, query)}
                      </span>
                    ))}
                  </div>
                )}
                <span className="search-result-card-phase">Phase {result.item.phase}</span>
              </Link>
            )
          })}
        </div>
      ) : query.trim().length >= 2 ? (
        <div className="search-empty-page">
          <p>No lessons matched your search.</p>
          <p>Try different keywords or broader terms.</p>
        </div>
      ) : null}
    </div>
  )
}
