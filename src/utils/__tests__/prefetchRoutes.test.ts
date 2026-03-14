import { describe, it, expect } from 'vitest'
import { prefetchRoute, createRoutePrefetchHandlers } from '../prefetchRoutes'

describe('prefetchRoutes', () => {

  it('should not throw on valid paths', () => {
    const validPaths = [
      '/',
      '/curriculum',
      '/phase/1',
      '/lesson/1',
      '/progress',
      '/exercises',
      '/solutions/1',
      '/search',
      '/concepts',
      '/stats',
      '/review'
    ]

    for (const p of validPaths) {
      expect(() => prefetchRoute(p)).not.toThrow()
      // Calling it a second time hits the cache branch
      expect(() => prefetchRoute(p)).not.toThrow()
    }
  })

  it('should not throw for unknown route', () => {
    expect(() => prefetchRoute('/unknown-route')).not.toThrow()
  })

  it('should create route prefetch handlers', () => {
    const handlers = createRoutePrefetchHandlers('/new-route-test-handlers')
    expect(handlers.onMouseEnter).toBeTypeOf('function')
    expect(handlers.onFocus).toBeTypeOf('function')
    expect(handlers.onTouchStart).toBeTypeOf('function')

    // execute them
    expect(() => handlers.onMouseEnter()).not.toThrow()
    expect(() => handlers.onFocus()).not.toThrow()
    expect(() => handlers.onTouchStart()).not.toThrow()
  })
})
