#!/usr/bin/env node

/**
 * Bundle Analysis Script
 *
 * Runs Vite build in analyze mode and outputs the treemap visualization.
 * Uses rollup-plugin-visualizer (already a dev dependency).
 *
 * Usage:
 *   pnpm run analyze:report
 *   node scripts/analyze-bundle.js
 */

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const reportPath = resolve(root, 'dist/stats.html')

console.log('🔍 Running bundle analysis build...\n')

try {
  execSync('pnpm run analyze', { cwd: root, stdio: 'inherit' })
} catch {
  console.error('\n❌ Build failed. Fix errors and retry.')
  process.exit(1)
}

if (existsSync(reportPath)) {
  console.log(`\n✅ Report generated: ${reportPath}`)
  console.log('   Open it in your browser to explore bundle composition.\n')
} else {
  console.log('\n⚠️  Build succeeded but stats.html was not generated.')
  console.log('   Ensure rollup-plugin-visualizer is installed.\n')
}
