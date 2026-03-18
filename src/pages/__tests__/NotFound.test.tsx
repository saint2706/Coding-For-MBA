import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import NotFound from '../NotFound'
import * as contentLoader from '../../utils/contentLoader'

vi.mock('../../components/SEOHead', () => ({
  default: () => <div data-testid="seo-head" />,
}))

vi.mock('../../utils/contentLoader', () => ({
  getAllPhases: vi.fn(),
  phaseIcons: ['📊', '🐍'],
}))

describe('NotFound', () => {
  let container: HTMLDivElement | null = null
  let root: any = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    container = null
    vi.clearAllMocks()
  })

  it('renders the 404 page correctly', () => {
    vi.mocked(contentLoader.getAllPhases).mockReturnValue([
      {
        phase: 1,
        title: 'Foundations',
        description: 'desc',
        days: [],
        objectives: [] as string[],
        content: '',
        path: '',
      },
      {
        phase: 3,
        title: 'Data',
        description: 'desc',
        days: [],
        objectives: [] as string[],
        content: '',
        path: '',
      },
    ])

    act(() => {
      root.render(
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>,
      )
    })

    expect(container?.innerHTML).toContain('404')
    expect(container?.innerHTML).toContain("page you're looking for doesn't exist")
    expect(container?.innerHTML).toContain('Phase 1: Foundations')
    expect(container?.innerHTML).toContain('Phase 3: Data')
    expect(container?.innerHTML).toContain('📖') // testing default fallback icon
  })
})
