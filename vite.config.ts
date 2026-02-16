import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'dev-csp-relaxation',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          // In dev mode, add CSP relaxations for HMR
          // Specifically target the Content-Security-Policy meta tag
          if (mode === 'development') {
            return html.replace(
              /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"\s*\/>/s,
              (_match, cspContent) => {
                let updated = cspContent
                // Add 'unsafe-inline' after 'self' in script-src for Vite HMR inline scripts
                updated = updated.replace(/script-src 'self'/, "script-src 'self' 'unsafe-inline'")
                // Add ws://localhost:* after 'self' in connect-src for Vite HMR WebSocket
                updated = updated.replace(
                  /connect-src 'self'/,
                  "connect-src 'self' ws://localhost:*",
                )
                return `<meta http-equiv="Content-Security-Policy" content="${updated}" />`
              },
            )
          }
          return html
        },
      },
    },
  ],
  base: process.env.VITE_BASE_PATH || '/Coding-For-MBA/',
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Normalize path separators for Windows
          const normalId = id.replace(/\\/g, '/')

          if (
            normalId.includes('node_modules/react-syntax-highlighter') ||
            normalId.includes('node_modules/refractor') ||
            normalId.includes('node_modules/prismjs')
          ) {
            return 'syntax-highlighter'
          }
          if (normalId.includes('node_modules/react-dom/')) {
            return 'react-dom'
          }
          if (
            normalId.includes('node_modules/react/') ||
            normalId.includes('node_modules/react-router') ||
            normalId.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor'
          }
          if (
            normalId.includes('node_modules/react-markdown') ||
            normalId.includes('node_modules/remark') ||
            normalId.includes('node_modules/rehype') ||
            normalId.includes('node_modules/unified') ||
            normalId.includes('node_modules/mdast') ||
            normalId.includes('node_modules/hast') ||
            normalId.includes('node_modules/micromark') ||
            normalId.includes('node_modules/vfile')
          ) {
            return 'markdown'
          }
          if (normalId.includes('node_modules/d3')) {
            return 'd3-vendor'
          }
          if (normalId.includes('node_modules/fuse.js')) {
            return 'search'
          }
          // Split lesson content files into their own chunk
          if (normalId.includes('/content/lessons/') && normalId.includes('README.md')) {
            return 'lesson-content'
          }
          if (normalId.includes('/content/lessons/') && normalId.includes('Phase_Overview.md')) {
            return 'phase-content'
          }
        },
      },
    },
  },
}))
