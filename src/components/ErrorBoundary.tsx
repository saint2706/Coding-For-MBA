/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree, logs those errors,
 * and displays a fallback UI instead of the component tree that crashed.
 *
 * Key Responsibilities:
 * - Catch unhandled errors in children.
 * - Log errors to console (and optionally a service).
 * - Render a user-friendly fallback UI with retry options.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { toastError } from '../utils/toast'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled UI error:', error, errorInfo)
    toastError('Something went wrong. Please try again.')
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false })
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="main-content" role="alert" aria-live="assertive">
          <h1>Something went wrong</h1>
          <p>We hit an unexpected issue while loading this page.</p>
          <div className="error-actions">
            <button type="button" className="action-btn" onClick={this.handleRetry}>
              Try again
            </button>
            <button type="button" className="action-btn" onClick={this.handleReload}>
              Reload page
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
