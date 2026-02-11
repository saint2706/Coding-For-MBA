/**
 * Sitemap generator for Coding for MBA.
 *
 * Scans the Lessons directory for README.md and Phase_Overview.md files,
 * extracts day/phase numbers, and writes a sitemap.xml to public/.
 *
 * Usage: node scripts/generate-sitemap.js
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const LESSONS_DIR = join(ROOT, 'Lessons')
const BASE_URL = process.env.SITE_URL || 'https://saint2706.github.io/Coding-For-MBA'

/** Extract frontmatter `day` or `phase` value from a markdown file. */
function extractNumber(filePath, key) {
  const raw = readFileSync(filePath, 'utf-8')
  const match = raw.match(new RegExp(`^${key}:\\s*(\\d+)`, 'm'))
  return match ? Number(match[1]) : null
}

/** Recursively find files matching a name. */
function findFiles(dir, filename) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, filename))
    } else if (entry.name === filename) {
      results.push(fullPath)
    }
  }
  return results
}

// Gather URLs
const urls = [{ loc: `${BASE_URL}/#/`, priority: '1.0' }]
urls.push({ loc: `${BASE_URL}/#/curriculum`, priority: '0.8' })

// Phase overviews
const phaseFiles = findFiles(LESSONS_DIR, 'Phase_Overview.md')
for (const file of phaseFiles) {
  const phase = extractNumber(file, 'phase')
  if (phase) {
    urls.push({ loc: `${BASE_URL}/#/phase/${phase}`, priority: '0.7' })
  }
}

// Lessons
const lessonFiles = findFiles(LESSONS_DIR, 'README.md')
for (const file of lessonFiles) {
  const day = extractNumber(file, 'day')
  if (day) {
    urls.push({ loc: `${BASE_URL}/#/lesson/${day}`, priority: '0.6' })
  }
}

// Sort for consistency
urls.sort((a, b) => a.loc.localeCompare(b.loc))

// Build XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

const outPath = join(ROOT, 'public', 'sitemap.xml')
writeFileSync(outPath, xml)
console.log(`✓ Sitemap written to ${outPath} (${urls.length} URLs)`)
