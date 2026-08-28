import { render, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SearchPalette from '../../../src/components/SearchPalette'
import * as searchIndex from '../../../src/utils/searchIndex'

const {
  mockNavigate,
  mockSetReadingMode,
  mockMarkLessonComplete,
  mockCompleteLesson,
  mockToastSuccess,
  prefsState,
  progressState,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSetReadingMode: vi.fn(),
  mockMarkLessonComplete: vi.fn(),
  mockCompleteLesson: vi.fn(),
  mockToastSuccess: vi.fn(),
  prefsState: { readingMode: false },
  progressState: { completedLessons: [] as number[] },
}))

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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../../src/stores/userPreferencesStore', () => ({
  useUserPreferencesStore: Object.assign(
    (selector: (state: { readingMode: boolean }) => unknown) => selector(prefsState),
    {
      getState: () => ({
        readingMode: prefsState.readingMode,
        setReadingMode: (value: boolean) => {
          mockSetReadingMode(value)
          prefsState.readingMode = value
        },
      }),
    },
  ),
}))

vi.mock('../../../src/stores/progressStore', () => ({
  useProgressStore: Object.assign(
    (selector: (state: { completedLessons: number[] }) => unknown) => selector(progressState),
    {
      getState: () => ({
        completedLessons: progressState.completedLessons,
        isLessonComplete: (day: string | number) =>
          progressState.completedLessons.includes(Number(day)),
        markLessonComplete: (day: string | number) => {
          mockMarkLessonComplete(day)
          progressState.completedLessons = [...progressState.completedLessons, Number(day)]
        },
      }),
    },
  ),
}))

vi.mock('../../../src/utils/toast', () => ({
  toastSuccess: mockToastSuccess,
  toastInfo: vi.fn(),
}))

vi.mock('../../../src/utils/completeLesson', () => ({
  completeLesson: mockCompleteLesson,
}))

describe('SearchPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
    prefsState.readingMode = false
    progressState.completedLessons = []
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <MemoryRouter>
        <SearchPalette isOpen={false} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
      </MemoryRouter>,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders input when open', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <SearchPalette isOpen={true} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
      </MemoryRouter>,
    )
    expect(getByRole('combobox', { name: /Search/i })).toBeDefined()
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
        <SearchPalette isOpen={true} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
      </MemoryRouter>,
    )

    const input = getByRole('combobox', { name: /Search/i })

    act(() => {
      fireEvent.change(input, { target: { value: 'test' } })
    })

    expect(getByText('Test Lesson')).toBeDefined()
    expect(getByText('Snippet of plain')).toBeDefined()
  })

  it('handles keyboard navigation over search results', () => {
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
        <SearchPalette isOpen={true} onClose={onClose} onOpenShortcuts={vi.fn()} />
      </MemoryRouter>,
    )

    const input = getByRole('combobox', { name: /Search/i })

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
        <SearchPalette isOpen={true} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
      </MemoryRouter>,
    )

    const input = getByRole('combobox', { name: /Search/i })

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
        <SearchPalette isOpen={true} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
      </MemoryRouter>,
    )

    const input = getByRole('combobox', { name: /Search/i })

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
        <SearchPalette isOpen={true} onClose={onClose} onOpenShortcuts={vi.fn()} />
      </MemoryRouter>,
    )

    const input = getByRole('combobox', { name: /Search/i })

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

  describe('quick actions (empty-query state)', () => {
    it('shows quick actions instead of a blank/type-to-search state when opened with no query', () => {
      const { getAllByRole, getByText } = render(
        <MemoryRouter initialEntries={['/']}>
          <SearchPalette isOpen={true} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
        </MemoryRouter>,
      )

      // 4 nav actions + reading mode toggle + open shortcuts = 6 (no
      // mark-complete action since we're not on a lesson route).
      const options = getAllByRole('option')
      expect(options).toHaveLength(6)
      expect(getByText('Go to Curriculum')).toBeDefined()
      expect(getByText('Go to Progress')).toBeDefined()
      expect(getByText('Go to Exercises')).toBeDefined()
      expect(getByText('Go to Settings')).toBeDefined()
      expect(getByText('Turn reading mode on')).toBeDefined()
      expect(getByText('Open keyboard shortcuts')).toBeDefined()
    })

    it('reflects the current reading-mode state in the toggle label', () => {
      prefsState.readingMode = true

      const { getByText } = render(
        <MemoryRouter initialEntries={['/']}>
          <SearchPalette isOpen={true} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
        </MemoryRouter>,
      )

      expect(getByText('Turn reading mode off')).toBeDefined()
    })

    it('navigates to Curriculum when that quick action is run', () => {
      const onClose = vi.fn()
      const { getByText } = render(
        <MemoryRouter initialEntries={['/']}>
          <SearchPalette isOpen={true} onClose={onClose} onOpenShortcuts={vi.fn()} />
        </MemoryRouter>,
      )

      act(() => {
        fireEvent.click(getByText('Go to Curriculum'))
      })

      expect(mockNavigate).toHaveBeenCalledWith('/curriculum')
      expect(onClose).toHaveBeenCalled()
    })

    it('supports arrow-key navigation and Enter across quick actions, identically to search results', () => {
      const onClose = vi.fn()
      const { getByRole, getAllByRole } = render(
        <MemoryRouter initialEntries={['/']}>
          <SearchPalette isOpen={true} onClose={onClose} onOpenShortcuts={vi.fn()} />
        </MemoryRouter>,
      )

      const input = getByRole('combobox', { name: /Search/i })
      const options = getAllByRole('option')
      expect(options[0]?.getAttribute('aria-selected')).toBe('true')

      // Move down to the "Go to Progress" action (index 1) and activate it.
      act(() => {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
      })
      expect(options[1]?.getAttribute('aria-selected')).toBe('true')

      act(() => {
        fireEvent.keyDown(input, { key: 'Enter' })
      })

      expect(mockNavigate).toHaveBeenCalledWith('/progress')
      expect(onClose).toHaveBeenCalled()
    })

    it('toggles reading mode via getState() and reflects the flip on the store', () => {
      const onClose = vi.fn()
      const { getByText } = render(
        <MemoryRouter initialEntries={['/']}>
          <SearchPalette isOpen={true} onClose={onClose} onOpenShortcuts={vi.fn()} />
        </MemoryRouter>,
      )

      act(() => {
        fireEvent.click(getByText('Turn reading mode on'))
      })

      expect(mockSetReadingMode).toHaveBeenCalledWith(true)
      expect(prefsState.readingMode).toBe(true)
      expect(onClose).toHaveBeenCalled()
    })

    it('opens the keyboard shortcuts overlay via the quick action', () => {
      const onClose = vi.fn()
      const onOpenShortcuts = vi.fn()
      const { getByText } = render(
        <MemoryRouter initialEntries={['/']}>
          <SearchPalette isOpen={true} onClose={onClose} onOpenShortcuts={onOpenShortcuts} />
        </MemoryRouter>,
      )

      act(() => {
        fireEvent.click(getByText('Open keyboard shortcuts'))
      })

      expect(onOpenShortcuts).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })

    it('does not show a mark-complete action off a lesson page', () => {
      const { queryByText } = render(
        <MemoryRouter initialEntries={['/']}>
          <SearchPalette isOpen={true} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
        </MemoryRouter>,
      )

      expect(queryByText(/Mark Day .* complete/)).toBeNull()
    })

    it('shows and runs mark-lesson-complete only on an incomplete lesson page', () => {
      const onClose = vi.fn()
      const { getByText } = render(
        <MemoryRouter initialEntries={['/lesson/5']}>
          <SearchPalette isOpen={true} onClose={onClose} onOpenShortcuts={vi.fn()} />
        </MemoryRouter>,
      )

      const action = getByText('Mark Day 5 complete')

      act(() => {
        fireEvent.click(action)
      })

      // Runs the shared completion pipeline (markLessonComplete, XP award,
      // achievement/phase/curriculum celebrations — see completeLesson.test.ts)
      // rather than mutating the progress store directly.
      expect(mockCompleteLesson).toHaveBeenCalledWith('5')
      expect(mockToastSuccess).toHaveBeenCalledWith('Day 5 marked complete')
      expect(onClose).toHaveBeenCalled()
    })

    it('hides mark-lesson-complete once the lesson is already complete', () => {
      progressState.completedLessons = [5]

      const { queryByText } = render(
        <MemoryRouter initialEntries={['/lesson/5']}>
          <SearchPalette isOpen={true} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
        </MemoryRouter>,
      )

      expect(queryByText('Mark Day 5 complete')).toBeNull()
    })

    it('switches from quick actions to search results without leaving stale options mounted', () => {
      vi.mocked(searchIndex.search).mockReturnValue([
        { item: { day: '01', title: 'Test Lesson', content: 'content' } },
      ] as unknown as ReturnType<typeof searchIndex.search>)

      const { getByRole, queryByText, getByText } = render(
        <MemoryRouter initialEntries={['/']}>
          <SearchPalette isOpen={true} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
        </MemoryRouter>,
      )

      expect(queryByText('Go to Curriculum')).not.toBeNull()

      const input = getByRole('combobox', { name: /Search/i })
      act(() => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      expect(queryByText('Go to Curriculum')).toBeNull()
      expect(getByText('Test Lesson')).toBeDefined()

      act(() => {
        fireEvent.change(input, { target: { value: '' } })
      })

      expect(queryByText('Go to Curriculum')).not.toBeNull()
      expect(queryByText('Test Lesson')).toBeNull()
    })
  })

  describe('focus management', () => {
    it('restores focus to the previously-focused element when it closes', () => {
      const trigger = document.createElement('button')
      trigger.textContent = 'Open search'
      document.body.appendChild(trigger)
      trigger.focus()
      expect(document.activeElement).toBe(trigger)

      const { rerender } = render(
        <MemoryRouter initialEntries={['/']}>
          <SearchPalette isOpen={true} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
        </MemoryRouter>,
      )

      act(() => {
        rerender(
          <MemoryRouter initialEntries={['/']}>
            <SearchPalette isOpen={false} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
          </MemoryRouter>,
        )
      })

      expect(document.activeElement).toBe(trigger)
      trigger.remove()
    })

    it('traps Tab focus so it cannot escape to elements outside the palette', () => {
      const outside = document.createElement('button')
      outside.textContent = 'Outside'
      document.body.appendChild(outside)

      const { getByRole, getByLabelText } = render(
        <MemoryRouter initialEntries={['/']}>
          <SearchPalette isOpen={true} onClose={vi.fn()} onOpenShortcuts={vi.fn()} />
        </MemoryRouter>,
      )

      const input = getByRole('combobox', { name: /Search/i })
      const closeBtn = getByLabelText('Close search')

      // Shift+Tab from the first focusable (input) should wrap to the last
      // (close button), not escape the dialog.
      input.focus()
      act(() => {
        fireEvent.keyDown(input, { key: 'Tab', shiftKey: true })
      })
      expect(document.activeElement).toBe(closeBtn)

      // Tab from the last focusable (close button) should wrap back to the
      // first (input), not escape to `outside`.
      act(() => {
        fireEvent.keyDown(closeBtn, { key: 'Tab' })
      })
      expect(document.activeElement).toBe(input)

      outside.remove()
    })
  })
})
