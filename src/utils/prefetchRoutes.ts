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
    { match: (path) => path === '/concepts', load: () => import('../pages/ConceptGraphPage') },
    { match: (path) => path === '/stats', load: () => import('../pages/ContentStats') },
    { match: (path) => path === '/review', load: () => import('../pages/Review') },
  ]

const prefetchedRoutes = new Set<string>()

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

export function createRoutePrefetchHandlers(path: string) {
  return {
    onMouseEnter: () => prefetchRoute(path),
    onFocus: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path),
  }
}
