import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import { toastError } from '../../../src/utils/toast'

vi.mock('../../../src/utils/toast', () => ({
  toastError: vi.fn(),
}))

const ThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Kaboom')
  }
  return <div>Everything is fine</div>
}

describe('ErrorBoundary', () => {
  let originalLocation: Location

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    originalLocation = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: vi.fn() },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('renders fallback UI and emits a safe toast message when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
    expect(toastError).toHaveBeenCalledWith('Something went wrong. Please try again.')
  })

  it('allows retrying rendering after an error', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )

    // Verify error UI is shown
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Rerender with a non-throwing component, simulating fixing the state
    rerender(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    )

    // Still shows error UI until retry is clicked
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Click retry
    const retryButton = screen.getByText('Try again')
    await user.click(retryButton)

    // Now it should show the normal component
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Everything is fine')).toBeInTheDocument()
  })

  it('reloads the page when reload button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )

    const reloadButton = screen.getByText('Reload page')
    await user.click(reloadButton)

    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })
})
