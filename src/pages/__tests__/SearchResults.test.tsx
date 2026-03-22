import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SearchResults from '../SearchResults'
import * as searchIndex from '../../utils/searchIndex'
vi.mock('../../components/SEOHead', () => ({
  default: () => <div data-testid="seo-head" />,
}))

vi.mock('../../components/Breadcrumb', () => ({
  default: () => <div data-testid="breadcrumb" />,
}))

vi.mock('../../components/EmptyStateIllustrations', () => ({
  SearchEmptyIllustration: () => <div data-testid="search-empty-illustration" />,
}))

vi.mock('../../utils/searchIndex', () => ({
  search: vi.fn(),
  extractMatchedTerms: vi.fn(),
  getSearchSnippet: vi.fn(),
  startBackgroundIndexing: vi.fn(),
}))

vi.mock('../../utils/searchHighlight', () => ({
  highlightText: vi.fn((text, terms) => {
    if (!terms || terms.length === 0) return text
    return `HIGHLIGHTED: ${text}`
  }),
}))

vi.mock('../../utils/contentLoader', () => ({
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
  },
}))

describe('SearchResults', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(searchIndex.search).mockReturnValue([])
    vi.mocked(searchIndex.extractMatchedTerms).mockReturnValue([])
    vi.mocked(searchIndex.getSearchSnippet).mockReturnValue('Snippet')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('renders initial state and starts background indexing', () => {
    render(
      <MemoryRouter>
        <SearchResults />
      </MemoryRouter>,
    )

    expect(screen.getByText('Search lessons')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Search title, concepts/)).toBeInTheDocument()
    expect(screen.getByText('Type at least 2 characters to search.')).toBeInTheDocument()
    expect(searchIndex.startBackgroundIndexing).toHaveBeenCalled()
  })

  it('updates input from URL query params', () => {
    render(
      <MemoryRouter initialEntries={['/search?q=python']}>
        <Routes>
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText(/Search title, concepts/) as HTMLInputElement
    expect(input.value).toBe('python')
  })

  it('performs search and displays results after debounce', () => {
    vi.mocked(searchIndex.search).mockReturnValue([
      {
        item: {
          day: '1',
          title: 'Python Basics',
          difficulty: 'beginner',
          phase: 1,
          plainContent: 'Content about python',
          concepts: ['loops'],
          tags: ['programming'],
        },
        score: 1,
        matches: [],
      },
    ] as any)
    vi.mocked(searchIndex.extractMatchedTerms).mockReturnValue(['python'])

    render(
      <MemoryRouter>
        <SearchResults />
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText(/Search title, concepts/)

    // Changing value to trigger debounce
    fireEvent.change(input, { target: { value: 'python' } })

    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(searchIndex.search).toHaveBeenCalledWith('python', 50)

    // Should display results
    expect(screen.getByText('1 result for “python”')).toBeInTheDocument()
    expect(screen.getByText('HIGHLIGHTED: Python Basics')).toBeInTheDocument()
    expect(screen.getByText('Day 1')).toBeInTheDocument()
    expect(screen.getByText('HIGHLIGHTED: loops')).toBeInTheDocument()
    expect(screen.getByText('HIGHLIGHTED: programming')).toBeInTheDocument()
  })

  it('displays empty state when search yields no results', () => {
    vi.mocked(searchIndex.search).mockReturnValue([])

    render(
      <MemoryRouter>
        <SearchResults />
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText(/Search title, concepts/)
    fireEvent.change(input, { target: { value: 'unknown' } })

    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(screen.getByText('No lessons matched your search.')).toBeInTheDocument()
  })

  it('handles keyboard shortcut to focus input (/)', () => {
    render(
      <MemoryRouter>
        <SearchResults />
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText(/Search title, concepts/)
    expect(document.activeElement).not.toBe(input)

    // Press /
    fireEvent.keyDown(window, { key: '/' })
    expect(document.activeElement).toBe(input)
  })

  it('handles Escape key to clear search and blur input', () => {
    render(
      <MemoryRouter initialEntries={['/search?q=python']}>
        <Routes>
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText(/Search title, concepts/) as HTMLInputElement
    input.focus()

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' })

    // Input should be cleared
    expect(input.value).toBe('')
  })
})
