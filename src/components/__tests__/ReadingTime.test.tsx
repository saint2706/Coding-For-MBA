import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import ReadingTime from '../ReadingTime'
import { getReadingTime } from '../../utils/contentLoader'

// Mock the utility
vi.mock('../../utils/contentLoader', () => ({
  getReadingTime: vi.fn(),
}))

describe('ReadingTime', () => {
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

  it('renders correctly with 1 minute', () => {
    vi.mocked(getReadingTime).mockReturnValue(1)

    act(() => {
      root?.render(<ReadingTime content="some short content" />)
    })

    expect(getReadingTime).toHaveBeenCalledWith('some short content')
    const span = container.querySelector('.reading-time')
    expect(span).toBeTruthy()
    expect(span?.textContent).toContain('1 min read')
    expect(span?.getAttribute('title')).toContain('1 minute')
  })

  it('renders correctly with multiple minutes', () => {
    vi.mocked(getReadingTime).mockReturnValue(5)

    act(() => {
      root?.render(<ReadingTime content="some long content" />)
    })

    expect(container.textContent).toContain('5 min read')
    const span = container.querySelector('.reading-time')
    expect(span?.getAttribute('title')).toContain('5 minutes')
  })
})
