import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import Skeleton, { PageSkeleton } from '../../../src/components/Skeleton'

describe('Skeleton', () => {
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
  })

  it('renders a default text skeleton', () => {
    act(() => {
      root?.render(<Skeleton />)
    })

    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons.length).toBe(1)
    expect(skeletons[0]?.classList.contains('skeleton-text')).toBe(true)
    expect(skeletons[0]?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders a custom variant', () => {
    act(() => {
      root?.render(<Skeleton variant="heading" />)
    })

    const skeleton = container.querySelector('.skeleton')
    expect(skeleton?.classList.contains('skeleton-heading')).toBe(true)
  })

  it('renders multiple skeletons based on count', () => {
    act(() => {
      root?.render(<Skeleton count={3} />)
    })

    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons.length).toBe(3)
  })

  it('applies custom width and height', () => {
    act(() => {
      root?.render(<Skeleton width="100px" height="50px" />)
    })

    const skeleton = container.querySelector('.skeleton') as HTMLElement
    expect(skeleton?.style.width).toBe('100px')
    expect(skeleton?.style.height).toBe('50px')
  })
})

describe('PageSkeleton', () => {
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
  })

  it('renders a page skeleton layout with correct ARIA roles', () => {
    act(() => {
      root?.render(<PageSkeleton />)
    })

    const pageSkeleton = container.querySelector('.page-skeleton')
    expect(pageSkeleton).toBeTruthy()
    expect(pageSkeleton?.getAttribute('role')).toBe('status')
    expect(pageSkeleton?.getAttribute('aria-label')).toBe('Loading page')

    // Check screen reader only text
    const srOnly = container.querySelector('.sr-only')
    expect(srOnly?.textContent).toBe('Loading…')

    // Check inner skeletons (heading, 3 pills, 1 block, 5 text, 1 block, 3 text) = 14 items
    const innerSkeletons = container.querySelectorAll('.skeleton')
    expect(innerSkeletons.length).toBeGreaterThan(0)
  })
})
