import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prefetchRoute, createRoutePrefetchHandlers } from '../prefetchRoutes'

// In test environments, prefetchRoute triggers dynamic imports which are sent
// via RPC to the Vitest worker. We prevent those dynamic imports from actually
// firing by directly intercepting the route handlers array itself if we could.
// Since we can't easily do that, we mock the imported pages so they resolve immediately
// and avoid the "Closing rpc while fetch was pending" error.

vi.mock('../pages/Home', async () => ({ default: () => null }))
vi.mock('../pages/Curriculum', async () => ({ default: () => null }))
vi.mock('../pages/PhaseOverview', async () => ({ default: () => null }))
vi.mock('../pages/Lesson', async () => ({ default: () => null }))
vi.mock('../pages/ProgressDashboard', async () => ({ default: () => null }))
vi.mock('../pages/Exercises', async () => ({ default: () => null }))
vi.mock('../pages/NotebookViewer', async () => ({ default: () => null }))
vi.mock('../pages/SearchResults', async () => ({ default: () => null }))
vi.mock('../pages/ConceptGraphPage', async () => ({ default: () => null }))
vi.mock('../pages/ContentStats', async () => ({ default: () => null }))
vi.mock('../pages/Review', async () => ({ default: () => null }))

describe('prefetchRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not throw on valid paths', async () => {
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

    // hit the fallback unknown route code path to get 100% coverage
    expect(() => prefetchRoute('/unknown-route')).not.toThrow()

    // allow pending mocks to settle
    await new Promise(resolve => setTimeout(resolve, 0))
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
