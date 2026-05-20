/**
 * Vite Plugin — Critical CSS (via Beasties)
 *
 * Inlines critical (above-the-fold) CSS into the HTML at build time
 * and lazy-loads the rest via preload. Only runs during production builds.
 *
 * Uses beasties (the maintained fork of critters).
 */

import path from 'node:path'

import type { Plugin, ResolvedConfig } from 'vite'

/**
 * Vite Plugin - Critical CSS
 * @returns {Plugin} The Vite plugin instance.
 */
export default function criticalCss(): Plugin {
  let resolvedConfig: ResolvedConfig | null = null

  return {
    name: 'vite-plugin-critical-css',
    apply: 'build',
    enforce: 'post',

    configResolved(config) {
      resolvedConfig = config
    },

    async transformIndexHtml(html: string) {
      try {
        const { default: Beasties } = await import('beasties')
        const outDir = resolvedConfig?.build.outDir ?? 'dist'
        const rootDir = resolvedConfig?.root ?? process.cwd()
        const beasties = new Beasties({
          path: path.resolve(rootDir, outDir),
          publicPath: resolvedConfig?.base ?? '/',
          inlineFonts: false,
          preload: 'swap',
          pruneSource: false,
          logLevel: 'error',
        })
        return await beasties.process(html)
      } catch {
        // If beasties fails, return original HTML without critical CSS
        return html
      }
    },
  }
}
