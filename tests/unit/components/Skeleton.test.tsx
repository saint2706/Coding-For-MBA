import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import Skeleton, { PageSkeleton, LessonSkeleton } from '../../../src/components/Skeleton'

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

  it('does not apply boot-sequence styling by default', () => {
    act(() => {
      root?.render(<Skeleton />)
    })

    const skeleton = container.querySelector('.skeleton')
    expect(skeleton?.classList.contains('skeleton-boot')).toBe(false)
  })

  it('applies the boot-sequence class and a per-line --index custom property when requested', () => {
    act(() => {
      root?.render(<Skeleton bootSequence count={3} bootIndex={2} />)
    })

    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons.length).toBe(3)
    skeletons.forEach((skeleton, i) => {
      expect(skeleton.classList.contains('skeleton-boot')).toBe(true)
      expect((skeleton as HTMLElement).style.getPropertyValue('--index')).toBe(String(2 + i))
    })
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

describe('LessonSkeleton', () => {
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

  it('renders the lesson boot-sequence skeleton with correct ARIA roles', () => {
    act(() => {
      root?.render(<LessonSkeleton />)
    })

    const lessonSkeleton = container.querySelector('.lesson-skeleton')
    expect(lessonSkeleton).toBeTruthy()
    expect(lessonSkeleton?.getAttribute('role')).toBe('status')
    expect(lessonSkeleton?.getAttribute('aria-label')).toBe('Loading lesson')

    const srOnly = container.querySelector('.sr-only')
    expect(srOnly?.textContent).toBe('Loading lesson…')
  })

  it('renders every line with the boot-sequence class and a strictly increasing --index', () => {
    act(() => {
      root?.render(<LessonSkeleton />)
    })

    const lines = Array.from(container.querySelectorAll('.skeleton'))
    expect(lines.length).toBeGreaterThan(10)

    const indices = lines.map((line) =>
      Number((line as HTMLElement).style.getPropertyValue('--index')),
    )

    lines.forEach((line) => {
      expect(line.classList.contains('skeleton-boot')).toBe(true)
    })
    // Top-to-bottom stagger: each line's index is unique and increasing in DOM order.
    expect(indices).toEqual([...indices].sort((a, b) => a - b))
    expect(new Set(indices).size).toBe(indices.length)
  })
})
