import { describe, it, expect, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import ProgressBar from '../ProgressBar'

// Mock motion to avoid animation issues in tests
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => {
      const {
        initial: _initial,
        animate: _animate,
        transition: _transition,
        ...safeProps
      } = props
      void _initial
      void _animate
      void _transition

      return (
        <div className={className} {...safeProps}>
          {children}
        </div>
      )
    },
  },
  useReducedMotion: () => false,
}))

describe('ProgressBar', () => {
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
    container?.remove()
    container = null
  })

  it('renders correctly with given progress', () => {
    act(() => {
      root.render(<ProgressBar completed={5} total={10} />)
    })

    const progressBar = container?.querySelector('[role="progressbar"]')
    expect(progressBar).not.toBeNull()
    expect(progressBar?.getAttribute('aria-valuenow')).toBe('50')
    expect(progressBar?.getAttribute('aria-valuemin')).toBe('0')
    expect(progressBar?.getAttribute('aria-valuemax')).toBe('100')
    expect(progressBar?.getAttribute('aria-label')).toBe('5 of 10 lessons completed')

    expect(container?.textContent).toContain('5/10 lessons')
  })

  it('renders correctly with 0 total', () => {
    act(() => {
      root.render(<ProgressBar completed={0} total={0} />)
    })

    const progressBar = container?.querySelector('[role="progressbar"]')
    expect(progressBar?.getAttribute('aria-valuenow')).toBe('0')
    expect(container?.textContent).toContain('0/0 lessons')
  })

  it('renders correctly with singular lesson label', () => {
    act(() => {
      root.render(<ProgressBar completed={1} total={1} />)
    })
    expect(container?.textContent).toContain('1/1 lesson')
  })

  it('hides label when showLabel is false', () => {
    act(() => {
      root.render(<ProgressBar completed={5} total={10} showLabel={false} />)
    })

    expect(container?.textContent).not.toContain('lessons')
  })

  it('calculates percentage correctly', () => {
    act(() => {
      root.render(<ProgressBar completed={1} total={3} />)
    })
    const progressBar = container?.querySelector('[role="progressbar"]')
    expect(progressBar?.getAttribute('aria-valuenow')).toBe('33')

    act(() => {
      root.render(<ProgressBar completed={2} total={3} />)
    })
    expect(progressBar?.getAttribute('aria-valuenow')).toBe('67')
  })
})
