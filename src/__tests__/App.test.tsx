import '@testing-library/jest-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import App from '../App'

vi.mock('../components/Navbar', () => ({
  default: ({ onToggleSidebar }: { onToggleSidebar: () => void }) => (
    <nav data-testid="navbar">
      <button onClick={onToggleSidebar} data-testid="toggle-sidebar">
        Toggle Sidebar
      </button>
    </nav>
  ),
}))
vi.mock('../components/SkipToContent', () => ({
  default: () => <div data-testid="skip-to-content">SkipToContent</div>,
}))
vi.mock('../components/ScrollProgress', () => ({
  default: (props: { isLesson?: boolean }) => (
    <div data-testid="scroll-progress" data-is-lesson={props.isLesson ? 'true' : 'false'}>
      ScrollProgress
    </div>
  ),
}))
vi.mock('../components/Skeleton', () => ({
  PageSkeleton: () => <div data-testid="page-skeleton">Skeleton</div>,
}))
vi.mock('../components/Sidebar', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <aside data-testid="sidebar" data-open={isOpen}>
      <button onClick={onClose} data-testid="close-sidebar">
        Close
      </button>
    </aside>
  ),
}))
vi.mock('../components/MobileNav', () => ({
  default: () => <nav data-testid="mobile-nav">MobileNav</nav>,
}))
vi.mock('../components/KeyboardShortcutsOverlay', () => ({
  default: () => <div data-testid="keyboard-shortcuts">Shortcuts</div>,
}))
vi.mock('../components/CustomCursor', () => ({
  default: () => <div data-testid="custom-cursor">Cursor</div>,
}))

vi.mock('../utils/progressTracker', () => ({ hydrateProgressStore: vi.fn() }))
vi.mock('../stores/quizStore', () => ({ hydrateQuizStore: vi.fn() }))

let mockSidebarDefaultOpen = true

vi.mock('../stores/userPreferencesStore', () => ({
  useUserPreferencesStore: vi.fn((selector) => {
    return selector({
      sidebarDefaultOpen: mockSidebarDefaultOpen,
      customCursorEnabled: true,
    })
  }),
}))
vi.mock('../hooks/useLearningAnalytics', () => ({ useLearningAnalytics: vi.fn() }))
vi.mock('../stores/gamificationStore', () => ({ hydrateGamificationStore: vi.fn() }))
vi.mock('../utils/searchIndex', () => ({ preloadSearchIndex: vi.fn() }))

vi.mock('../pages/Home', () => ({ default: () => <div data-testid="page-home">Home</div> }))
vi.mock('../pages/Lesson', () => ({ default: () => <div data-testid="page-lesson">Lesson</div> }))
vi.mock('../pages/PhaseOverview', () => ({
  default: () => <div data-testid="page-phase">PhaseOverview</div>,
}))
vi.mock('../pages/Curriculum', () => ({
  default: () => <div data-testid="page-curriculum">Curriculum</div>,
}))
vi.mock('../pages/SearchResults', () => ({
  default: () => <div data-testid="page-search">SearchResults</div>,
}))
vi.mock('../pages/ProgressDashboard', () => ({
  default: () => <div data-testid="page-progress">ProgressDashboard</div>,
}))
vi.mock('../pages/Exercises', () => ({
  default: () => <div data-testid="page-exercises">Exercises</div>,
}))
vi.mock('../pages/NotebookViewer', () => ({
  default: () => <div data-testid="page-solutions">NotebookViewer</div>,
}))
vi.mock('../pages/ConceptGraphPage', () => ({
  default: () => <div data-testid="page-concepts">ConceptGraphPage</div>,
}))
vi.mock('../pages/ContentStats', () => ({
  default: () => <div data-testid="page-stats">ContentStats</div>,
}))
vi.mock('../pages/Review', () => ({ default: () => <div data-testid="page-review">Review</div> }))
vi.mock('../pages/CaseStudies', () => ({
  default: () => <div data-testid="page-cases">CaseStudies</div>,
}))
vi.mock('../pages/NotFound', () => ({
  default: () => <div data-testid="page-notfound">NotFound</div>,
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.className = ''
    mockSidebarDefaultOpen = true
    vi.stubGlobal(
      'requestIdleCallback',
      vi.fn((cb) => cb()),
    )
  })

  it('renders standard layout elements', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
    })

    expect(screen.getByTestId('skip-to-content')).toBeInTheDocument()
    expect(screen.getByTestId('scroll-progress')).toBeInTheDocument()
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveClass('main-content')
  })

  it('toggles sidebar state', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
    })

    const user = userEvent.setup()

    expect(document.body).toHaveClass('sidebar-open')

    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'true')

    await user.click(screen.getByTestId('toggle-sidebar'))
    expect(document.body).not.toHaveClass('sidebar-open')
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'false')

    await user.click(screen.getByTestId('toggle-sidebar'))
    expect(document.body).toHaveClass('sidebar-open')
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'true')

    await user.click(screen.getByTestId('close-sidebar'))
    expect(document.body).not.toHaveClass('sidebar-open')
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'false')
  })

  it('scrolls to top on navigation', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/lesson/1']}>
          <App />
        </MemoryRouter>,
      )
    })

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0)
    scrollToSpy.mockRestore()
  })

  it('cleans up body class on unmount', async () => {
    let unmountApp: () => void = () => {}

    await act(async () => {
      const { unmount } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
      unmountApp = unmount
    })

    expect(document.body).toHaveClass('sidebar-open')

    await act(async () => {
      unmountApp()
    })

    expect(document.body).not.toHaveClass('sidebar-open')
  })

  it('calls requestIdleCallback for preloadSearchIndex if available', async () => {
    const { preloadSearchIndex } = await import('../utils/searchIndex')

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
    })

    expect(window.requestIdleCallback).toHaveBeenCalled()
    expect(preloadSearchIndex).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('calls setTimeout for preloadSearchIndex if requestIdleCallback is not available', async () => {
    const originalRIC = window.requestIdleCallback
    delete (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback
    vi.useFakeTimers()
    const { preloadSearchIndex } = await import('../utils/searchIndex')

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
    })

    vi.advanceTimersByTime(500)
    expect(preloadSearchIndex).toHaveBeenCalled()

    vi.useRealTimers()
    window.requestIdleCallback = originalRIC
  })

  it('renders all routes correctly via Suspense', async () => {
    const paths = [
      '/curriculum',
      '/phase/1',
      '/lesson/1',
      '/progress',
      '/exercises',
      '/solutions/1',
      '/search',
      '/concepts',
      '/stats',
      '/review',
      '/case-studies',
      '/notfound123',
    ]

    for (const path of paths) {
      await act(async () => {
        const { unmount } = render(
          <MemoryRouter initialEntries={[path]}>
            <App />
          </MemoryRouter>,
        )
        unmount()
      })
    }
  })

  it('resets sidebar state on location change based on user preference', async () => {
    mockSidebarDefaultOpen = false

    let unmountApp: () => void = () => {}

    await act(async () => {
      const { unmount } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
      unmountApp = unmount
    })

    // Initially closed because mockSidebarDefaultOpen is false
    expect(document.body).not.toHaveClass('sidebar-open')

    await act(async () => {
      screen.getByTestId('toggle-sidebar').click()
    })

    expect(document.body).toHaveClass('sidebar-open')

    // Simulate location change unmount and remounting App via react-router setup
    await act(async () => {
      unmountApp()
      render(
        <MemoryRouter initialEntries={['/lesson/1']}>
          <App />
        </MemoryRouter>,
      )
    })

    // Should reset to default which is closed
    expect(document.body).not.toHaveClass('sidebar-open')
  })
})

describe('App custom cursor', () => {
  it('does not render CustomCursor when disabled in preferences', async () => {
    mockSidebarDefaultOpen = true

    // Create a new mock that returns false for customCursorEnabled
    vi.doMock('../stores/userPreferencesStore', () => ({
      useUserPreferencesStore: vi.fn((selector) => {
        return selector({
          sidebarDefaultOpen: true,
          customCursorEnabled: false,
        })
      }),
    }))

    // Needs to reset modules to pick up the doMock
    vi.resetModules()

    // Import dynamically after resetting modules
    const AppDynamic = (await import('../App')).default

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppDynamic />
        </MemoryRouter>,
      )
    })

    expect(screen.queryByTestId('custom-cursor')).not.toBeInTheDocument()
  })
})

describe('App isLesson prop actual', () => {
  it('passes isLesson=true to ScrollProgress when on a lesson path', async () => {
    // Re-import App dynamically to ensure it uses the updated mock
    const AppDynamic = (await import('../App')).default

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/lesson/1']}>
          <AppDynamic />
        </MemoryRouter>,
      )
    })

    expect(screen.getByTestId('scroll-progress')).toHaveAttribute('data-is-lesson', 'true')
  })

  it('passes isLesson=false to ScrollProgress when not on a lesson path', async () => {
    const AppDynamic = (await import('../App')).default

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppDynamic />
        </MemoryRouter>,
      )
    })

    expect(screen.getByTestId('scroll-progress')).toHaveAttribute('data-is-lesson', 'false')
  })
})
