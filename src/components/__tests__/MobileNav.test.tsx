import { render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation, type Location } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import MobileNav from '../MobileNav'

// Mock prefetch routes as it relies on external routing setup
vi.mock('../../utils/prefetchRoutes', () => ({
  createRoutePrefetchHandlers: vi.fn((route: string) => ({
    onMouseEnter: vi.fn(),
    onFocus: vi.fn(),
    onTouchStart: vi.fn(),
    'data-prefetch-route': route, // added an identifier to verify the route being passed
  })),
}))

// Mock useLocation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useLocation: vi.fn(),
  }
})

describe('MobileNav', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all navigation items correctly', () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    } as Location)

    render(
      <MemoryRouter>
        <MobileNav />
      </MemoryRouter>,
    )

    // Check if the navigation container is rendered
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument()

    // Check if all four items are rendered
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Learn')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
    expect(screen.getByText('Explore')).toBeInTheDocument()
  })

  it('sets "Home" as active when on root path', () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    } as Location)

    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileNav />
      </MemoryRouter>,
    )

    const homeLink = screen.getByText('Home').closest('a')
    expect(homeLink).toHaveClass('active')

    const learnLink = screen.getByText('Learn').closest('a')
    expect(learnLink).not.toHaveClass('active')
  })

  it('sets "Learn" as active when on curriculum path', () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/curriculum',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    } as Location)

    render(
      <MemoryRouter initialEntries={['/curriculum']}>
        <MobileNav />
      </MemoryRouter>,
    )

    const learnLink = screen.getByText('Learn').closest('a')
    expect(learnLink).toHaveClass('active')
  })

  it('sets "Progress" as active when on progress path', () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/progress',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    } as Location)

    render(
      <MemoryRouter initialEntries={['/progress']}>
        <MobileNav />
      </MemoryRouter>,
    )

    const progressLink = screen.getByText('Progress').closest('a')
    expect(progressLink).toHaveClass('active')
  })

  it('sets "Explore" as active when on concepts path', () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/concepts',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    } as Location)

    render(
      <MemoryRouter initialEntries={['/concepts']}>
        <MobileNav />
      </MemoryRouter>,
    )

    const exploreLink = screen.getByText('Explore').closest('a')
    expect(exploreLink).toHaveClass('active')
  })

  it('sets "Explore" as active when on a lesson path', () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/lesson/1',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    } as Location)

    render(
      <MemoryRouter initialEntries={['/lesson/1']}>
        <MobileNav />
      </MemoryRouter>,
    )

    const exploreLink = screen.getByText('Explore').closest('a')
    expect(exploreLink).toHaveClass('active')
  })

  it('applies prefetch handlers to navigation links', () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    } as Location)

    render(
      <MemoryRouter>
        <MobileNav />
      </MemoryRouter>,
    )

    const homeLink = screen.getByText('Home').closest('a')
    expect(homeLink).toHaveAttribute('data-prefetch-route', '/')

    const learnLink = screen.getByText('Learn').closest('a')
    expect(learnLink).toHaveAttribute('data-prefetch-route', '/curriculum')

    const progressLink = screen.getByText('Progress').closest('a')
    expect(progressLink).toHaveAttribute('data-prefetch-route', '/progress')

    const exploreLink = screen.getByText('Explore').closest('a')
    expect(exploreLink).toHaveAttribute('data-prefetch-route', '/concepts')
  })
})
