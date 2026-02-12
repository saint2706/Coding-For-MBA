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
import App from './App'
import './styles/index.css'

/**
 * Renders the React application into the DOM.
 * Wraps the app in necessary providers for routing, SEO, and development tooling.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
