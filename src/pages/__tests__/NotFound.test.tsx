import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import NotFound from '../NotFound'

// Mock SEOHead
vi.mock('../../components/SEOHead', () => ({
  default: ({ title, noIndex }: any) => (
    <div data-testid="mock-seo-head" data-title={title} data-noindex={noIndex} />
  ),
}))

// Mock Breadcrumb
vi.mock('../../components/Breadcrumb', () => ({
  default: ({ items }: any) => (
    <div data-testid="mock-breadcrumb">
      {items.map((item: any, i: number) => (
        <span key={i}>{item.label}</span>
      ))}
    </div>
  ),
}))

// Mock contentLoader
vi.mock('../../utils/contentLoader', () => ({
  phaseIcons: ['1️⃣', '2️⃣'],
  getAllPhases: vi.fn(() => [
    { phase: 1, title: 'Phase One' },
    { phase: 2, title: 'Phase Two' },
    { phase: 3, title: 'Phase Three' }, // No icon defined for this one
  ]),
}))

describe('NotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the 404 page correctly', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    )

    // Check header and code
    expect(screen.getAllByText('404').length).toBeGreaterThan(0)
    expect(screen.getByText(/The page you're looking for doesn't exist/)).toBeDefined()

    // Check SEO head properties
    const seoHead = screen.getByTestId('mock-seo-head')
    expect(seoHead.getAttribute('data-title')).toBe('Page Not Found')
    expect(seoHead.getAttribute('data-noindex')).toBe('true')

    // Check Breadcrumbs
    expect(screen.getByTestId('mock-breadcrumb')).toBeDefined()
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0)

    // Check actions
    expect(screen.getByText('← Back to Home')).toBeDefined()
    expect(screen.getByText('Browse Curriculum')).toBeDefined()

    // Check suggestions / phases
    expect(screen.getByText('Quick Links')).toBeDefined()
    expect(screen.getByText('Phase 1: Phase One')).toBeDefined()
    expect(screen.getByText('Phase 2: Phase Two')).toBeDefined()
    expect(screen.getByText('Phase 3: Phase Three')).toBeDefined() // Fallback icon should be used

    // Check shortcuts tip
    expect(screen.getByText(/Tip: Press/)).toBeDefined()
  })
})
