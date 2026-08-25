import { render, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SearchPalette from '../../../src/components/SearchPalette'
import * as searchIndex from '../../../src/utils/searchIndex'

// Mock dependencies
vi.mock('../../../src/utils/searchIndex', async () => {
  const actual = await vi.importActual('../../../src/utils/searchIndex')
  return {
    ...(actual as typeof searchIndex),
    getSearchSnippet: vi.fn((content) => 'Snippet of ' + content),
    getSearchIndexStatus: vi.fn(() => ({
      isReady: true,
      isIndexing: false,
      processedCount: 10,
      totalCount: 10,
    })),
    search: vi.fn(),
    subscribeSearchIndexStatus: vi.fn(() => () => {}),
  }
})

vi.mock('../../../src/utils/contentLoader', async () => {
  const actual = await vi.importActual<typeof import('../../../src/utils/contentLoader')>(
    '../../../src/utils/contentLoader',
  )
  return {
    ...actual,
    difficultyConfig: {
      beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
    },
  }
})

// Mock useDebounce to execute immediately
vi.mock('../../../src/hooks/useDebounce', () => ({
  useDebounce: (val: string) => val,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('SearchPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <MemoryRouter>
        <SearchPalette isOpen={false} onClose={vi.fn()} />
      </MemoryRouter>,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders input when open', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <SearchPalette isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>,
    )
    expect(getByRole('textbox', { name: /Search/i })).toBeDefined()
  })

  it('shows results for a valid query', () => {
    vi.mocked(searchIndex.search).mockReturnValue([
      {
        item: {
          day: '01',
          title: 'Test Lesson',
          content: 'content',
          plainContent: 'plain',
          difficulty: 'beginner',
          tags: ['test'],
        },
      },
    ] as unknown as ReturnType<typeof searchIndex.search>)

    const { getByRole, getByText } = render(
      <MemoryRouter>
        <SearchPalette isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>,
    )

    const input = getByRole('textbox', { name: /Search/i })

    act(() => {
      fireEvent.change(input, { target: { value: 'test' } })
    })

    expect(getByText('Test Lesson')).toBeDefined()
    expect(getByText('Snippet of plain')).toBeDefined()
  })

  it('handles keyboard navigation', () => {
    vi.mocked(searchIndex.search).mockReturnValue([
      {
        item: { day: '01', title: 'Test Lesson 1', content: 'content1' },
      },
      {
        item: { day: '02', title: 'Test Lesson 2', content: 'content2' },
      },
    ] as unknown as ReturnType<typeof searchIndex.search>)

    const onClose = vi.fn()
    const { getByRole, getAllByRole } = render(
      <MemoryRouter>
        <SearchPalette isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    )

    const input = getByRole('textbox', { name: /Search/i })

    act(() => {
      fireEvent.change(input, { target: { value: 'test' } })
    })

    const options = getAllByRole('option')
    expect(options[0]?.getAttribute('aria-selected')).toBe('true')
    expect(options[1]?.getAttribute('aria-selected')).toBe('false')

    // Arrow down
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' })
    })

    expect(options[0]?.getAttribute('aria-selected')).toBe('false')
    expect(options[1]?.getAttribute('aria-selected')).toBe('true')

    // Arrow up
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowUp' })
    })

    expect(options[0]?.getAttribute('aria-selected')).toBe('true')
    expect(options[1]?.getAttribute('aria-selected')).toBe('false')

    // Enter
    act(() => {
      fireEvent.keyDown(input, { key: 'Enter' })
    })

    expect(mockNavigate).toHaveBeenCalledWith('/lesson/01')
    expect(onClose).toHaveBeenCalled()

    // Escape
    act(() => {
      fireEvent.keyDown(input, { key: 'Escape' })
    })

    expect(onClose).toHaveBeenCalledTimes(2)

    // Default branch keydown
    act(() => {
      fireEvent.keyDown(input, { key: 'a' })
    })

    expect(onClose).toHaveBeenCalledTimes(2) // No extra calls
  })

  it('displays indexing message when not ready', () => {
    vi.mocked(searchIndex.getSearchIndexStatus).mockReturnValue({
      isReady: false,
      isIndexing: true,
      processedCount: 5,
      totalCount: 10,
    })
    vi.mocked(searchIndex.search).mockReturnValue([])

    const { getByRole, getByText } = render(
      <MemoryRouter>
        <SearchPalette isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>,
    )

    const input = getByRole('textbox', { name: /Search/i })

    act(() => {
      fireEvent.change(input, { target: { value: 'te' } })
    })

    expect(getByText('Indexing lessons… (5/10)')).toBeDefined()
  })

  it('displays empty results message', () => {
    vi.mocked(searchIndex.getSearchIndexStatus).mockReturnValue({
      isReady: true,
      isIndexing: false,
      processedCount: 10,
      totalCount: 10,
    })
    vi.mocked(searchIndex.search).mockReturnValue([])

    const { getByRole, getByText } = render(
      <MemoryRouter>
        <SearchPalette isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>,
    )

    const input = getByRole('textbox', { name: /Search/i })

    act(() => {
      fireEvent.change(input, { target: { value: 'nonexistent' } })
    })

    expect(getByText('No results found for “nonexistent”')).toBeDefined()
  })

  it('navigates to result on click', () => {
    vi.mocked(searchIndex.search).mockReturnValue([
      {
        item: {
          day: '03',
          title: 'Click Lesson',
          content: 'content',
        },
      },
    ] as unknown as ReturnType<typeof searchIndex.search>)

    const onClose = vi.fn()
    const { getByRole, getByText } = render(
      <MemoryRouter>
        <SearchPalette isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    )

    const input = getByRole('textbox', { name: /Search/i })

    act(() => {
      fireEvent.change(input, { target: { value: 'click' } })
    })

    const result = getByText('Click Lesson')
    act(() => {
      fireEvent.click(result)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/lesson/03')
    expect(onClose).toHaveBeenCalled()
  })
})
