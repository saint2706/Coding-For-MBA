import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import RelatedLessons from '../RelatedLessons'
import * as contentLoader from '../../utils/contentLoader'

vi.mock('../../utils/contentLoader', () => ({
  getRelatedLessons: vi.fn(),
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
  },
}))

describe('RelatedLessons', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('renders nothing if no related lessons', () => {
    vi.mocked(contentLoader.getRelatedLessons).mockReturnValue([])

    act(() => {
      root?.render(
        <RelatedLessons
          lesson={{ day: '02', title: '', phase: 1, content: '', path: '', tags: [] } as unknown as Readonly<contentLoader.Lesson>}
        />
      )
    })

    expect(container.innerHTML).toBe('')
  })

  it('renders a grid of related lessons', () => {
    vi.mocked(contentLoader.getRelatedLessons).mockReturnValue([
      { day: '01', title: 'Lesson 1', phase: 1, content: '', path: '', difficulty: 'beginner', tags: ['a', 'b'] } as unknown as Readonly<contentLoader.Lesson>,
      { day: '03', title: 'Lesson 3', phase: 2, content: '', path: '', tags: ['b', 'c'] } as unknown as Readonly<contentLoader.Lesson>,
    ])

    act(() => {
      root?.render(
        <MemoryRouter>
          <RelatedLessons
            lesson={{ day: '02', title: '', phase: 1, content: '', path: '', tags: ['b', 'd'] } as unknown as Readonly<contentLoader.Lesson>}
          />
        </MemoryRouter>,
      )
    })

    const section = container.querySelector('.related-lessons')
    expect(section).toBeTruthy()
    expect(section?.getAttribute('aria-label')).toBe('Related lessons')

    const cards = container.querySelectorAll('.related-lesson-card')
    expect(cards.length).toBe(2)

    // First card
    expect(cards[0]!.getAttribute('href')).toBe('/lesson/01')
    expect(cards[0]!.textContent).toContain('Lesson 1')
    expect(cards[0]!.textContent).toContain('Day 01 · Phase 1')

    // Test shared tag highlighting
    const sharedTag = cards[0]!.querySelector('.related-tag.shared')
    expect(sharedTag).toBeTruthy()
    expect(sharedTag?.textContent).toBe('b')

    // Second card - tests fallback difficulty
    expect(cards[1]!.textContent).toContain('Beginner')
  })
})
