/**
 * Route Prefetching Strategy
 *
 * Implements a manual prefetching mechanism to load page chunks before navigation.
 * Uses `import()` syntax to trigger Vite's code splitting and preloading.
 *
 * Key Responsibilities:
 * - Map route paths to their corresponding component imports.
 * - Deduplicate prefetch requests to avoid redundant network calls.
 * - Provide event handlers (onMouseEnter, etc.) for predictive loading.
 */

const routePrefetchers: Array<{ match: (path: string) => boolean; load: () => Promise<unknown> }> =
  [
    { match: (path) => path === '/', load: () => import('../pages/Home') },
    { match: (path) => path === '/curriculum', load: () => import('../pages/Curriculum') },
    { match: (path) => path.startsWith('/phase/'), load: () => import('../pages/PhaseOverview') },
    { match: (path) => path.startsWith('/lesson/'), load: () => import('../pages/Lesson') },
    { match: (path) => path === '/progress', load: () => import('../pages/ProgressDashboard') },
    { match: (path) => path === '/exercises', load: () => import('../pages/Exercises') },
    {
      match: (path) => path.startsWith('/solutions/'),
      load: () => import('../pages/NotebookViewer'),
    },
    { match: (path) => path === '/search', load: () => import('../pages/SearchResults') },
    { match: (path) => path === '/notes', load: () => import('../pages/NotesPage') },
    { match: (path) => path === '/settings', load: () => import('../pages/SettingsPage') },
    { match: (path) => path === '/stats', load: () => import('../pages/ContentStats') },
    { match: (path) => path === '/review', load: () => import('../pages/Review') },
  ]

const prefetchedRoutes = new Set<string>()

/**
 * Trigger a prefetch for the code chunk associated with a route path.
 * Safe to call multiple times; will only load once.
 *
 * @param {string} path - The route path to prefetch (e.g., '/lesson/1').
 * @returns {void}
 */
export function prefetchRoute(path: string) {
  if (prefetchedRoutes.has(path)) {
    return
  }

  const route = routePrefetchers.find(({ match }) => match(path))
  if (!route) {
    return
  }

  prefetchedRoutes.add(path)
  void route.load()
}

let prefetchTimeout: ReturnType<typeof setTimeout> | null = null

export function prefetchRouteDebounced(path: string) {
  if (prefetchTimeout) {
    clearTimeout(prefetchTimeout)
  }
  prefetchTimeout = setTimeout(() => {
    prefetchRoute(path)
  }, 50)
}

/**
 * Creates event handlers for prefetching on hover, focus, or touch.
 * Spread these props onto a Link or Button element.
 *
 * @param {string} path - The target route path.
 * @returns {{onMouseEnter: () => void, onFocus: () => void, onTouchStart: () => void}} The event handlers.
 */
export function createRoutePrefetchHandlers(path: string) {
  return {
    onMouseEnter: () => prefetchRouteDebounced(path),
    onFocus: () => prefetchRouteDebounced(path),
    onTouchStart: () => prefetchRouteDebounced(path),
  }
}
