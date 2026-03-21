import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import ConceptGraphPage from '../ConceptGraphPage'

vi.mock('../../components/SEOHead', () => ({
  default: () => <div data-testid="seo-head" />,
}))

vi.mock('../../components/ConceptGraph', () => ({
  default: ({ search, highlightPhase }: any) => (
    <div data-testid="concept-graph">
      Search: {search}, Phase: {highlightPhase}
    </div>
  ),
}))

vi.mock('../../components/Breadcrumb', () => ({
  default: () => <div data-testid="breadcrumb" />,
}))

describe('ConceptGraphPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('renders the page and graph correctly', () => {
    render(
      <MemoryRouter>
        <ConceptGraphPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('🔗 Concept Dependency Graph')).toBeInTheDocument()
    expect(screen.getByTestId('concept-graph')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search lessons or concepts…')).toBeInTheDocument()
  })

  it('updates search after debounce', () => {
    render(
      <MemoryRouter>
        <ConceptGraphPage />
      </MemoryRouter>,
    )

    const searchInput = screen.getByPlaceholderText('Search lessons or concepts…')

    // Changing value to trigger debounce
    fireEvent.change(searchInput, { target: { value: 'python' } })

    // Before debounce, it should still be empty in the component
    // But testing library's fireEvent might trigger updates synchronously depending on useDebounce implementation.
    // Our mock will simply use act if necessary.

    act(() => {
      vi.advanceTimersByTime(300)
    })

    // After debounce, it should be updated
    expect(screen.getByTestId('concept-graph')).toHaveTextContent('Search: python, Phase:')
  })

  it('toggles phase highlight on click', () => {
    render(
      <MemoryRouter>
        <ConceptGraphPage />
      </MemoryRouter>,
    )

    const phase1Button = screen.getByRole('button', { name: /Filter by Phase 1/i })

    // Initial state
    expect(phase1Button).toHaveAttribute('aria-pressed', 'false')

    // Click to select
    fireEvent.click(phase1Button)
    expect(phase1Button).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('concept-graph')).toHaveTextContent('Search: , Phase: 1')

    // Click to deselect
    fireEvent.click(phase1Button)
    expect(phase1Button).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByTestId('concept-graph')).toHaveTextContent('Search: , Phase:')
  })
})
