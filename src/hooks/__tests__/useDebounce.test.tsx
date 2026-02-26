import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    let debouncedValue: string | undefined

    function TestComponent({ value, delay }: { value: string; delay: number }) {
      debouncedValue = useDebounce(value, delay)
      return null
    }

    act(() => {
      root?.render(<TestComponent value="test" delay={500} />)
    })

    expect(debouncedValue).toBe('test')
  })

  it('should debounce value updates', () => {
    let debouncedValue: string | undefined

    function TestComponent({ value, delay }: { value: string; delay: number }) {
      debouncedValue = useDebounce(value, delay)
      return null
    }

    // Initial render
    act(() => {
      root?.render(<TestComponent value="initial" delay={500} />)
    })
    expect(debouncedValue).toBe('initial')

    // Update value
    act(() => {
      root?.render(<TestComponent value="updated" delay={500} />)
    })
    // Should still be initial
    expect(debouncedValue).toBe('initial')

    // Advance timers partly
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(debouncedValue).toBe('initial')

    // Advance timers to complete delay
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(debouncedValue).toBe('updated')
  })

  it('should reset immediately if condition is met', () => {
    let debouncedValue: string | undefined

    function TestComponent({ value, delay }: { value: string; delay: number }) {
      debouncedValue = useDebounce(value, delay, (val) => val === '')
      return null
    }

    // Initial render
    act(() => {
      root?.render(<TestComponent value="initial" delay={500} />)
    })
    expect(debouncedValue).toBe('initial')

    // Update to empty string (should reset immediately)
    act(() => {
      root?.render(<TestComponent value="" delay={500} />)
    })

    // Since delay is 0, we still need to advance timers to let the loop run
    act(() => {
      vi.runAllTimers()
    })
    expect(debouncedValue).toBe('')
  })

  it('should cancel previous timeout on new update', () => {
    let debouncedValue: string | undefined

    function TestComponent({ value, delay }: { value: string; delay: number }) {
      debouncedValue = useDebounce(value, delay)
      return null
    }

    // Initial render
    act(() => {
      root?.render(<TestComponent value="initial" delay={500} />)
    })

    // Update to 'update1'
    act(() => {
      root?.render(<TestComponent value="update1" delay={500} />)
    })

    // Advance 200ms
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Update to 'update2' before 'update1' resolves
    act(() => {
      root?.render(<TestComponent value="update2" delay={500} />)
    })

    // Advance another 300ms (total 500ms since start, but only 300ms since update2)
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Should NOT be update1
    expect(debouncedValue).toBe('initial') // Still initial because update2 reset the timer

    // Advance another 200ms (total 500ms since update2)
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(debouncedValue).toBe('update2')
  })
})
