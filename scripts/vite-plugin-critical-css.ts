/**
 * Vite Plugin — Critical CSS (via Beasties)
 *
 * Inlines critical (above-the-fold) CSS into the HTML at build time
 * and lazy-loads the rest via preload. Only runs during production builds.
 *
 * Uses beasties (the maintained fork of critters).
 */

import type { Plugin } from 'vite'

export default function criticalCss(): Plugin {
  return {
    name: 'vite-plugin-critical-css',
    apply: 'build',
    enforce: 'post',

    async transformIndexHtml(html: string) {
      try {
        const { default: Beasties } = await import('beasties')
        const beasties = new Beasties({
          path: '', // not used since we pass HTML directly
          publicPath: '',
          inlineFonts: false,
          preload: 'swap',
          pruneSource: false,
        })
        return await beasties.process(html)
      } catch {
        // If beasties fails, return original HTML without critical CSS
        return html
      }
    },
  }
}
