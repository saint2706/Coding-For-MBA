import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import ConceptGraph from '../ConceptGraph'
import * as contentLoader from '../../utils/contentLoader'
import * as dayToken from '../../utils/dayToken'

// Mock dependencies
vi.mock('../../utils/contentLoader', async () => {
  const actual = await vi.importActual('../../utils/contentLoader')
  return {
    ...(actual as typeof contentLoader),
    getAllLessons: vi.fn(),
    phaseIcons: ['📖', '🚀', '🧠'],
  }
})

vi.mock('../../utils/dayToken', async () => {
  const actual = await vi.importActual('../../utils/dayToken')
  return {
    ...(actual as typeof dayToken),
    dayTokenFromReference: vi.fn((ref: string) => ref.replace('D', '')),
  }
})

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock SVG Element functions used by D3 and matchMedia
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  Object.defineProperty(HTMLDivElement.prototype, 'clientWidth', {
    configurable: true,
    value: 800,
  })

  Object.defineProperty(HTMLDivElement.prototype, 'clientHeight', {
    configurable: true,
    value: 600,
  })

  // Mock SVGElement attributes used by d3 zoom
  // SVGSVGElement is missing properties in jsdom
  Object.defineProperty(SVGSVGElement.prototype, 'viewBox', {
    configurable: true,
    get: () => ({ baseVal: { width: 800, height: 600, x: 0, y: 0 } }),
  })

  Object.defineProperty(SVGSVGElement.prototype, 'width', {
    configurable: true,
    get: () => ({ baseVal: { value: 800 } }),
  })

  Object.defineProperty(SVGSVGElement.prototype, 'height', {
    configurable: true,
    get: () => ({ baseVal: { value: 600 } }),
  })
})

describe('ConceptGraph', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    vi.clearAllMocks()

    vi.mocked(contentLoader.getAllLessons).mockReturnValue([
      { day: 1, title: 'Lesson 1', phase: 1, content: '', path: '', concepts: ['react', 'state'] },
      {
        day: 2,
        title: 'Lesson 2',
        phase: 1,
        content: '',
        path: '',
        concepts: ['props'],
        prerequisites: ['D1'],
      },
      {
        day: 3,
        title: 'Lesson 3',
        phase: 2,
        content: '',
        path: '',
        concepts: ['hooks'],
        prerequisites: ['D1', 'D2'],
      },
    ] as unknown as ReadonlyArray<Readonly<contentLoader.Lesson>>)
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
  })

  it('renders graph SVG and container', () => {
    act(() => {
      root!.render(
        <MemoryRouter>
          <ConceptGraph />
        </MemoryRouter>,
      )
    })

    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('role')).toBe('img')
    expect(svg?.getAttribute('aria-label')).toBe(
      'Concept dependency graph showing lesson relationships',
    )
  })

  it('filters nodes based on search query matching concept', () => {
    act(() => {
      root!.render(
        <MemoryRouter>
          <ConceptGraph search="state" />
        </MemoryRouter>,
      )
    })

    const nodes = container.querySelectorAll('.graph-node')
    expect(nodes.length).toBe(3)

    const day1Node = Array.from(nodes).find((n) => n.textContent?.includes('D1'))
    const day2Node = Array.from(nodes).find((n) => n.textContent?.includes('D2'))

    expect(day1Node?.getAttribute('opacity')).toBe('1')
    expect(day2Node?.getAttribute('opacity')).toBe('0.08')
  })

  it('filters nodes based on highlightPhase', () => {
    act(() => {
      root!.render(
        <MemoryRouter>
          <ConceptGraph highlightPhase={2} />
        </MemoryRouter>,
      )
    })

    const nodes = container.querySelectorAll('.graph-node')
    const day1Node = Array.from(nodes).find((n) => n.textContent?.includes('D1'))
    const day3Node = Array.from(nodes).find((n) => n.textContent?.includes('D3'))

    expect(day1Node?.getAttribute('opacity')).toBe('0.08') // Phase 1
    expect(day3Node?.getAttribute('opacity')).toBe('1') // Phase 2
  })

  it('handles empty data correctly', () => {
    vi.mocked(contentLoader.getAllLessons).mockReturnValue([])
    act(() => {
      root!.render(
        <MemoryRouter>
          <ConceptGraph />
        </MemoryRouter>,
      )
    })

    const nodes = container.querySelectorAll('.graph-node')
    expect(nodes.length).toBe(0)
  })

  it('navigates to lesson on node click', () => {
    act(() => {
      root!.render(
        <MemoryRouter>
          <ConceptGraph />
        </MemoryRouter>,
      )
    })

    const day1Node = Array.from(container.querySelectorAll('.graph-node')).find((n) =>
      n.textContent?.includes('D1'),
    )
    expect(day1Node).toBeTruthy()

    act(() => {
      const clickEvent = new MouseEvent('click', { bubbles: true })
      // D3 nodes have datum bound to them
      day1Node!.dispatchEvent(clickEvent)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/lesson/1')
  })

  it('shows and hides tooltip on mouse interactions', () => {
    const mockRect = {
      left: 100,
      top: 100,
      width: 800,
      height: 600,
      right: 900,
      bottom: 700,
      x: 100,
      y: 100,
      toJSON: () => {},
    }

    act(() => {
      root!.render(
        <MemoryRouter>
          <ConceptGraph />
        </MemoryRouter>,
      )
    })

    const renderedContainer = container.querySelector('.concept-graph-container') as HTMLDivElement
    renderedContainer.getBoundingClientRect = vi.fn(() => mockRect)

    const day1Node = Array.from(container.querySelectorAll('.graph-node')).find((n) =>
      n.textContent?.includes('D1'),
    )

    act(() => {
      const mouseEvent = new MouseEvent('mousemove', { bubbles: true, clientX: 150, clientY: 150 })
      day1Node!.dispatchEvent(mouseEvent)
    })

    const tooltip = container.querySelector('.graph-tooltip')
    expect(tooltip).toBeTruthy()
    expect(tooltip?.textContent).toContain('Day 1')
    expect(tooltip?.textContent).toContain('Lesson 1')
    expect(tooltip?.textContent).toContain('react')

    // Simulate mouse leave using the specific method in the component
    act(() => {
      // The leave event handler is bound via onMouseLeave in React, which fires a simulated React event.
      // D3 might prevent bubbling, but let's just trigger it directly on the svg
      const svg = container.querySelector('svg')

      // In React, onMouseLeave is triggered via relatedTarget logic on mouseout
      const mouseOutEvent = new MouseEvent('mouseout', { bubbles: true })
      svg!.dispatchEvent(mouseOutEvent)

      const mouseLeaveEvent = new Event('mouseleave', { bubbles: false })
      svg!.dispatchEvent(mouseLeaveEvent)
    })

    expect(container.querySelector('.graph-tooltip')).toBeNull()
  })

  it('covers mouse leave on a non-node', () => {
    act(() => {
      root!.render(
        <MemoryRouter>
          <ConceptGraph />
        </MemoryRouter>,
      )
    })
    const svg = container.querySelector('svg')
    act(() => {
      const mouseEvent = new MouseEvent('mousemove', { bubbles: true, clientX: 300, clientY: 300 })
      svg!.dispatchEvent(mouseEvent)
    })
    expect(container.querySelector('.graph-tooltip')).toBeNull()
  })

  it('hides tooltip if mouse moves off a node', () => {
    const mockRect = {
      left: 100,
      top: 100,
      width: 800,
      height: 600,
      right: 900,
      bottom: 700,
      x: 100,
      y: 100,
      toJSON: () => {},
    }

    act(() => {
      root!.render(
        <MemoryRouter>
          <ConceptGraph />
        </MemoryRouter>,
      )
    })

    const renderedContainer = container.querySelector('.concept-graph-container') as HTMLDivElement
    renderedContainer.getBoundingClientRect = vi.fn(() => mockRect)

    const day1Node = Array.from(container.querySelectorAll('.graph-node')).find((n) =>
      n.textContent?.includes('D1'),
    )

    // Show tooltip first
    act(() => {
      const mouseEvent = new MouseEvent('mousemove', { bubbles: true, clientX: 150, clientY: 150 })
      day1Node!.dispatchEvent(mouseEvent)
    })

    expect(container.querySelector('.graph-tooltip')).toBeTruthy()

    // Move mouse over SVG itself (not a node)
    act(() => {
      // Dispatch on SVG directly, it shouldn't have .graph-node class
      const mouseEvent = new MouseEvent('mousemove', { bubbles: true, clientX: 300, clientY: 300 })
      const svg = container.querySelector('svg')
      svg!.dispatchEvent(mouseEvent)
    })

    expect(container.querySelector('.graph-tooltip')).toBeNull()
  })
})
