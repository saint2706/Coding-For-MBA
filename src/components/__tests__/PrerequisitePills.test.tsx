import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import PrerequisitePills from '../PrerequisitePills'
import * as contentLoader from '../../utils/contentLoader'

vi.mock('../../utils/contentLoader', () => ({
  getPrerequisiteLessons: vi.fn(),
}))

describe('PrerequisitePills', () => {
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

  it('renders nothing if there are no prerequisites', () => {
    vi.mocked(contentLoader.getPrerequisiteLessons).mockReturnValue([])

    act(() => {
      root?.render(
        <PrerequisitePills
          lesson={{ day: '02', title: '', phase: 1, content: '', path: '' } as unknown as Readonly<contentLoader.Lesson>}
        />
      )
    })

    expect(container.innerHTML).toBe('')
  })

  it('renders prerequisite links', () => {
    vi.mocked(contentLoader.getPrerequisiteLessons).mockReturnValue([
      { day: '01', title: 'Lesson 1', phase: 1, content: '', path: '' } as unknown as Readonly<contentLoader.Lesson>,
    ])

    act(() => {
      root?.render(
        <MemoryRouter>
          <PrerequisitePills
            lesson={{ day: '02', title: '', phase: 1, content: '', path: '' } as unknown as Readonly<contentLoader.Lesson>}
          />
        </MemoryRouter>,
      )
    })

    const bar = container.querySelector('.prerequisite-bar')
    expect(bar).toBeTruthy()
    expect(bar?.getAttribute('role')).toBe('navigation')

    const links = container.querySelectorAll('a.prerequisite-pill')
    expect(links.length).toBe(1)
    expect(links[0]!.getAttribute('href')).toBe('/lesson/01')
    expect(links[0]!.textContent).toBe('Day 01: Lesson 1')
  })
})
