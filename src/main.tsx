/**
 * Application Entry Point
 *
 * Bootstraps the React application and mounts it to the DOM.
 *
 * Key Responsibilities:
 * - Initialize React Root.
 * - Configure global providers (Helmet, Router, ErrorBoundary).
 * - Import global styles.
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
