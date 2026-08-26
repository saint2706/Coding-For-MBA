import '@testing-library/jest-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

vi.mock('../../src/components/Navbar', () => ({
  default: ({ onToggleSidebar }: { onToggleSidebar: () => void }) => (
    <nav data-testid="navbar">
      <button onClick={onToggleSidebar} data-testid="toggle-sidebar">
        Toggle Sidebar
      </button>
    </nav>
  ),
}))
vi.mock('../../src/components/SkipToContent', () => ({
  default: () => <div data-testid="skip-to-content">SkipToContent</div>,
}))
vi.mock('../../src/components/ScrollProgress', () => ({
  default: (props: { isLesson?: boolean }) => (
    <div data-testid="scroll-progress" data-is-lesson={props.isLesson ? 'true' : 'false'}>
      ScrollProgress
    </div>
  ),
}))
vi.mock('../../src/components/Skeleton', () => ({
  PageSkeleton: () => <div data-testid="page-skeleton">Skeleton</div>,
  LessonSkeleton: () => <div data-testid="lesson-skeleton">LessonSkeleton</div>,
}))
vi.mock('../../src/components/Sidebar', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <aside data-testid="sidebar" data-open={isOpen}>
      <button onClick={onClose} data-testid="close-sidebar">
        Close
      </button>
    </aside>
  ),
}))
vi.mock('../../src/components/MobileNav', () => ({
  default: () => <nav data-testid="mobile-nav">MobileNav</nav>,
}))
vi.mock('../../src/components/KeyboardShortcutsOverlay', () => ({
  default: () => <div data-testid="keyboard-shortcuts">Shortcuts</div>,
}))
vi.mock('../../src/components/CustomCursor', () => ({
  default: () => <div data-testid="custom-cursor">Cursor</div>,
}))
vi.mock('../../src/components/SearchPalette', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="search-palette">
        <button onClick={onClose} data-testid="close-search-palette">
          Close
        </button>
      </div>
    ) : null,
}))

vi.mock('../../src/utils/progressTracker', () => ({ hydrateProgressStore: vi.fn() }))
vi.mock('../../src/stores/quizStore', () => ({ hydrateQuizStore: vi.fn() }))

let mockSidebarDefaultOpen = true

vi.mock('../../src/stores/userPreferencesStore', () => ({
  useUserPreferencesStore: vi.fn((selector) => {
    return selector({
      sidebarDefaultOpen: mockSidebarDefaultOpen,
      customCursorEnabled: true,
    })
  }),
}))
vi.mock('../../src/hooks/useLearningAnalytics', () => ({ useLearningAnalytics: vi.fn() }))
vi.mock('../../src/stores/gamificationStore', () => ({ hydrateGamificationStore: vi.fn() }))
vi.mock('../../src/utils/searchIndex', () => ({ preloadSearchIndex: vi.fn() }))

vi.mock('../../src/pages/Home', () => ({ default: () => <div data-testid="page-home">Home</div> }))
vi.mock('../../src/pages/Lesson', () => ({
  default: () => <div data-testid="page-lesson">Lesson</div>,
}))
vi.mock('../../src/pages/PhaseOverview', () => ({
  default: () => <div data-testid="page-phase">PhaseOverview</div>,
}))
vi.mock('../../src/pages/Curriculum', () => ({
  default: () => <div data-testid="page-curriculum">Curriculum</div>,
}))
vi.mock('../../src/pages/SearchResults', () => ({
  default: () => <div data-testid="page-search">SearchResults</div>,
}))
vi.mock('../../src/pages/ProgressDashboard', () => ({
  default: () => <div data-testid="page-progress">ProgressDashboard</div>,
}))
vi.mock('../../src/pages/Exercises', () => ({
  default: () => <div data-testid="page-exercises">Exercises</div>,
}))
vi.mock('../../src/pages/NotebookViewer', () => ({
  default: () => <div data-testid="page-solutions">NotebookViewer</div>,
}))
vi.mock('../../src/pages/ConceptGraphPage', () => ({
  default: () => <div data-testid="page-concepts">ConceptGraphPage</div>,
}))
vi.mock('../../src/pages/ContentStats', () => ({
  default: () => <div data-testid="page-stats">ContentStats</div>,
}))
vi.mock('../../src/pages/Review', () => ({
  default: () => <div data-testid="page-review">Review</div>,
}))
vi.mock('../../src/pages/CaseStudies', () => ({
  default: () => <div data-testid="page-cases">CaseStudies</div>,
}))
vi.mock('../../src/pages/NotFound', () => ({
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
    const { preloadSearchIndex } = await import('../../src/utils/searchIndex')

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
    const { preloadSearchIndex } = await import('../../src/utils/searchIndex')

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
    vi.doMock('../../src/stores/userPreferencesStore', () => ({
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
    const AppDynamic = (await import('../../src/App')).default

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
    const AppDynamic = (await import('../../src/App')).default

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
    const AppDynamic = (await import('../../src/App')).default

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

describe('App command palette shortcut', () => {
  it('opens the command palette on Ctrl+K', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
    })

    expect(screen.queryByTestId('search-palette')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    })

    expect(screen.getByTestId('search-palette')).toBeInTheDocument()
  })

  it('opens the command palette on Cmd+K (metaKey)', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      fireEvent.keyDown(window, { key: 'K', metaKey: true })
    })

    expect(screen.getByTestId('search-palette')).toBeInTheDocument()
  })

  it('closes the command palette when Ctrl+K is pressed again (toggle)', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    })
    expect(screen.getByTestId('search-palette')).toBeInTheDocument()

    await act(async () => {
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    })
    expect(screen.queryByTestId('search-palette')).not.toBeInTheDocument()
  })

  it('opens the command palette even while focus is inside an editable element', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
    })

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    await act(async () => {
      fireEvent.keyDown(input, { key: 'k', ctrlKey: true })
    })

    expect(screen.getByTestId('search-palette')).toBeInTheDocument()
    input.remove()
  })

  it('closes the command palette via its own onClose callback', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    })
    expect(screen.getByTestId('search-palette')).toBeInTheDocument()

    await act(async () => {
      screen.getByTestId('close-search-palette').click()
    })
    expect(screen.queryByTestId('search-palette')).not.toBeInTheDocument()
  })
})

describe('App Suspense fallback', () => {
  // Each test resets the module registry and re-imports App so the lazy-loaded
  // route chunks haven't already resolved from an earlier test — otherwise the
  // fallback never has a chance to render before the "page" mock swaps in.
  it('shows the lesson boot-sequence skeleton as the Suspense fallback on a lesson route', async () => {
    vi.resetModules()
    const AppDynamic = (await import('../../src/App')).default

    render(
      <MemoryRouter initialEntries={['/lesson/1']}>
        <AppDynamic />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('lesson-skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('page-skeleton')).not.toBeInTheDocument()
  })

  it('shows the generic page skeleton as the Suspense fallback on non-lesson routes', async () => {
    vi.resetModules()
    const AppDynamic = (await import('../../src/App')).default

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppDynamic />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('page-skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('lesson-skeleton')).not.toBeInTheDocument()
  })
})
