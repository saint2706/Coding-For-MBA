/**
 * Application Entry Point
 *
 * Initializes the React application with necessary providers:
 * - React.StrictMode for development checks
 * - HelmetProvider for managing document head
 * - HashRouter for GitHub Pages compatibility
 * - App component as root
 *
 * Uses HashRouter instead of BrowserRouter to support GitHub Pages
 * deployment without server-side routing configuration.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { HelmetProvider } from '@dr.pogodin/react-helmet'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { TOAST_DEFAULT_OPTIONS } from './utils/toast'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/index.css'

/**
 * Renders the React application into the DOM.
 * Wraps the app in necessary providers for routing, SEO, and development tooling.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <HashRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <Toaster position="top-right" toastOptions={TOAST_DEFAULT_OPTIONS} />
      </HashRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
