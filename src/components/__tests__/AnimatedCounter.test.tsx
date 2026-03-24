import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import AnimatedCounter from '../AnimatedCounter'
import * as motionReact from 'motion/react'

vi.mock('motion/react', () => ({
  animate: vi.fn(),
  useInView: vi.fn(),
  useReducedMotion: vi.fn(),
}))

describe('AnimatedCounter', () => {
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

  it('renders target value immediately if reduced motion is preferred', () => {
    vi.mocked(motionReact.useInView).mockReturnValue(true)
    vi.mocked(motionReact.useReducedMotion).mockReturnValue(true)

    act(() => {
      root?.render(<AnimatedCounter value={100} />)
    })

    expect(container.textContent).toBe('100')
    expect(motionReact.animate).not.toHaveBeenCalled()
  })

  it('renders 0 initially if animation is preferred and not in view', () => {
    vi.mocked(motionReact.useInView).mockReturnValue(false)
    vi.mocked(motionReact.useReducedMotion).mockReturnValue(false)

    act(() => {
      root?.render(<AnimatedCounter value={100} />)
    })

    expect(container.textContent).toBe('0')
    expect(motionReact.animate).not.toHaveBeenCalled()
  })

  it('triggers animation when in view', () => {
    vi.mocked(motionReact.useInView).mockReturnValue(true)
    vi.mocked(motionReact.useReducedMotion).mockReturnValue(false)

    let updateCallback: (val: number) => void = () => {}

    vi.mocked(motionReact.animate).mockImplementation((_from, _to, options: unknown) => {
      if (options && typeof (options as { onUpdate?: unknown }).onUpdate === 'function') {
        updateCallback = (options as { onUpdate: (val: number) => void }).onUpdate
      }
      return { stop: vi.fn() } as unknown as ReturnType<typeof motionReact.animate>
    })

    act(() => {
      root?.render(<AnimatedCounter value={100} />)
    })

    expect(motionReact.animate).toHaveBeenCalled()
    expect(container.textContent).toBe('0')

    act(() => {
      updateCallback(50)
    })

    expect(container.textContent).toBe('50')
  })

  it('formats the value correctly', () => {
    vi.mocked(motionReact.useInView).mockReturnValue(true)
    vi.mocked(motionReact.useReducedMotion).mockReturnValue(true)

    act(() => {
      root?.render(<AnimatedCounter value={1000} format={(v) => '$' + v} />)
    })

    expect(container.textContent).toBe('$1000')
  })

  it('adds suffix correctly', () => {
    vi.mocked(motionReact.useInView).mockReturnValue(true)
    vi.mocked(motionReact.useReducedMotion).mockReturnValue(true)

    act(() => {
      root?.render(<AnimatedCounter value={100} suffix="%" />)
    })

    expect(container.textContent).toBe('100%')
  })
})
