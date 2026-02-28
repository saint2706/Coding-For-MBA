import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, isValidElement, type ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { highlightText } from '../../utils/searchHighlight'
import SearchResults from '../SearchResults'

const { mockSemanticSearch, mockSearch } = vi.hoisted(() => ({
  mockSemanticSearch: vi.fn(),
  mockSearch: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams('q=data')],
}))

vi.mock('../../hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}))

vi.mock('../../utils/searchIndex', () => ({
  extractMatchedTerms: (query: string) => query,
  getSearchSnippet: () => 'Keyword fallback snippet',
  search: mockSearch,
}))

vi.mock('../../utils/semanticSearch', () => ({
  semanticSearch: mockSemanticSearch,
}))

vi.mock('../../utils/geminiClient', () => ({
  isGeminiAvailable: () => true,
}))

vi.mock('../../utils/contentLoader', () => ({
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
  },
}))

vi.mock('../../components/SEOHead', () => ({ default: () => null }))
vi.mock('../../components/Breadcrumb', () => ({ default: () => null }))
vi.mock('../../components/EmptyStateIllustrations', () => ({
  SearchEmptyIllustration: () => null,
}))

describe('highlightText', () => {
  it('highlights repeated matching terms', () => {
    const result = highlightText('data data DATA', 'data')

    const marked = result.filter((part) => isValidElement(part) && part.type === 'mark')
    expect(marked).toHaveLength(3)

    expect(
      marked.map((part) =>
        isValidElement(part) ? (part as ReactElement<{ children: string }>).props.children : part,
      ),
    ).toEqual(['data', 'data', 'DATA'])
  })

  it('matches mixed-case queries case-insensitively', () => {
    const result = highlightText('Python and pyThOn tips', 'PyThOn')

    const marked = result.filter((part) => isValidElement(part) && part.type === 'mark')
    expect(marked).toHaveLength(2)
    expect(
      marked.map((part) =>
        isValidElement(part) ? (part as ReactElement<{ children: string }>).props.children : part,
      ),
    ).toEqual(['Python', 'pyThOn'])
  })
})

describe('SearchResults semantic failure UX', () => {
  let container: HTMLDivElement | null = null
  let root: Root | null = null

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root!.unmount()
      })
    }
    if (container) {
      document.body.removeChild(container)
    }
    vi.clearAllMocks()
  })

  it('shows an inline semantic error and falls back to lexical results', async () => {
    mockSearch.mockReturnValue([
      {
        item: {
          day: 7,
          title: 'Data Cleaning Basics',
          difficulty: 'beginner',
          plainContent: 'Use strip and lower.',
          concepts: ['cleaning'],
          tags: ['python'],
          phase: 1,
        },
      },
    ])
    mockSemanticSearch.mockRejectedValue(new Error('Gemini down'))

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    const mountedRoot = root

    await act(async () => {
      mountedRoot.render(<SearchResults />)
    })

    const toggle = container.querySelector('.semantic-search-toggle') as HTMLButtonElement
    expect(toggle).not.toBeNull()

    await act(async () => {
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(container.textContent).toContain(
      'AI search is temporarily unavailable. Showing keyword results instead.',
    )
    expect(container.textContent).toContain('Data Cleaning Basics')
    expect(mockSearch).toHaveBeenCalledWith('data', 50)
  })
})
