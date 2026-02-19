import { act } from 'react'
import ReactDOM from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ErrorBoundary from '../ErrorBoundary'
import { toastError } from '../../utils/toast'

vi.mock('../../utils/toast', () => ({
  toastError: vi.fn(),
}))

const ThrowingComponent = () => {
  throw new Error('Kaboom')
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('renders fallback UI and emits a safe toast message when a child throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    document.body.innerHTML = '<div id="root"></div>'
    const rootElement = document.getElementById('root')
    expect(rootElement).not.toBeNull()

    const root = ReactDOM.createRoot(rootElement as HTMLElement)

    await act(async () => {
      root.render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>,
      )
    })

    expect(document.body.textContent).toContain('Something went wrong')
    expect(document.body.textContent).toContain('Try again')
    expect(toastError).toHaveBeenCalledWith('Something went wrong. Please try again.')

    consoleErrorSpy.mockRestore()
  })
})
