/**
 * Vite Configuration
 *
 * Configures the build toolchain for the React application.
 *
 * Key Responsibilities:
 * - Configure React plugin.
 * - Set base URL for GitHub Pages deployment.
 * - Define code splitting chunks (manualChunks).
 * - Relax CSP for development mode (HMR support).
 * - Configure bundle analysis (optional).
 */

import { defineConfig, type HtmlTagDescriptor, type PluginOption, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import criticalCss from './scripts/vite-plugin-critical-css.ts'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const analyzePlugin: PluginOption = (
    mode === 'analyze'
      ? await import('rollup-plugin-visualizer' as string)
          .then((mod) =>
            (mod as { visualizer: (options: Record<string, unknown>) => unknown }).visualizer({
              filename: 'dist/stats.html',
              gzipSize: true,
              brotliSize: true,
              template: 'treemap',
            }),
          )
          .catch(() => null)
      : null
  ) as PluginOption

  const config: UserConfig = {
    plugins: [
      react(),
      criticalCss(),
      analyzePlugin,
      {
        name: 'dev-csp-relaxation',
        transformIndexHtml: {
          order: 'pre',
          handler(html: string): string | HtmlTagDescriptor[] {
            if (mode === 'development') {
              return html.replace(
                /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"\s*\/>/s,
                (_match: string, cspContent: string) => {
                  let updated = cspContent
                  updated = updated.replace(
                    /script-src 'self'/,
                    "script-src 'self' 'unsafe-inline'",
                  )
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
      target: 'es2022',
      chunkSizeWarningLimit: 1500,
      modulePreload: {
        polyfill: false,
        resolveDependencies(_filename: string, deps: string[], context: { hostType: string }) {
          if (context.hostType !== 'js') {
            return deps
          }

          const priority = ['react-vendor', 'react-dom', 'motion', 'search', 'markdown']

          return [...new Set(deps)]
            .filter((dep) => dep.endsWith('.js') || dep.endsWith('.css'))
            .sort((a, b) => {
              const aIndex = priority.findIndex((chunk) => a.includes(chunk))
              const bIndex = priority.findIndex((chunk) => b.includes(chunk))
              const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex
              const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex

              if (aRank !== bRank) {
                return aRank - bRank
              }

              return a.localeCompare(b)
            })
        },
      },
      rolldownOptions: {
        output: {
          manualChunks(id: string) {
            // Normalize path separators for Windows
            const normalId = id.replace(/\\/g, '/')

            if (
              normalId.includes('node_modules/react-syntax-highlighter') ||
              normalId.includes('node_modules/refractor') ||
              normalId.includes('node_modules/prismjs')
            ) {
              return 'syntax-highlighter'
            }
            // ⚡ Bolt: Bundle react-dom with react to prevent runtime ESM initialization errors
            // and reduce redundant network requests for highly coupled core libraries.
            if (
              normalId.includes('node_modules/react/') ||
              normalId.includes('node_modules/react-dom/') ||
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
            if (
              normalId.includes('node_modules/motion') ||
              normalId.includes('node_modules/framer-motion')
            ) {
              return 'motion'
            }
            if (normalId.includes('node_modules/zustand')) {
              return 'zustand'
            }
            // Split lesson content files into per-phase chunks
            if (normalId.includes('/content/lessons/')) {
              const phaseMatch = normalId.match(/Phase_(\d+)/)
              const phaseNum = phaseMatch ? phaseMatch[1] : 'other'

              if (normalId.includes('README.md')) {
                return `phase-${phaseNum}-content`
              }
              if (normalId.includes('Phase_Overview.md')) {
                return `phase-${phaseNum}-overview`
              }
            }
          },
        },
      },
    },
  }

  return config
})
