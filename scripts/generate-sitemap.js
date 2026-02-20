/**
 * Enhanced sitemap generator for Coding for MBA.
 *
 * Scans the content/lessons directory for README.md and Phase_Overview.md files,
 * extracts day/phase numbers, and writes a sitemap.xml to public/.
 * Includes lastmod, changefreq, and all static pages.
 *
 * Usage: node scripts/generate-sitemap.js
 */

/**
 * Sitemap Generator
 *
 * Scans the curriculum content directory to generate a `sitemap.xml` file.
 * Helps search engines discover all lesson and phase pages.
 *
 * Key Responsibilities:
 * - Crawl `content/lessons` for Markdown files.
 * - Extract metadata (day, phase) to build route URLs.
 * - Assign priority and change frequency based on page type.
 * - Output a standards-compliant XML sitemap.
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const LESSONS_DIR = join(ROOT, 'content', 'lessons')
const BASE_URL = process.env.SITE_URL || 'https://saint2706.github.io/Coding-For-MBA'

/** Format a Date as YYYY-MM-DD for sitemap lastmod */
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

/** Extract frontmatter `day` or `phase` value from a markdown file. */
function extractNumber(filePath, key) {
  const raw = readFileSync(filePath, 'utf-8')
  const match = raw.match(new RegExp(`^${key}:\\s*(\\d+)`, 'm'))
  return match ? Number(match[1]) : null
}

/** Get the last modified date of a file */
function getLastModified(filePath) {
  try {
    const stats = statSync(filePath)
    return formatDate(stats.mtime)
  } catch {
    return formatDate(new Date())
  }
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

const today = formatDate(new Date())

// Gather URLs — static pages
const urls = [
  { loc: `${BASE_URL}/#/`, priority: '1.0', changefreq: 'weekly', lastmod: today },
  { loc: `${BASE_URL}/#/curriculum`, priority: '0.8', changefreq: 'monthly', lastmod: today },
  { loc: `${BASE_URL}/#/exercises`, priority: '0.7', changefreq: 'monthly', lastmod: today },
  { loc: `${BASE_URL}/#/progress`, priority: '0.5', changefreq: 'daily', lastmod: today },
  { loc: `${BASE_URL}/#/concepts`, priority: '0.6', changefreq: 'monthly', lastmod: today },
  { loc: `${BASE_URL}/#/stats`, priority: '0.4', changefreq: 'monthly', lastmod: today },
  { loc: `${BASE_URL}/#/review`, priority: '0.5', changefreq: 'daily', lastmod: today },
]

// Phase overviews
const phaseFiles = findFiles(LESSONS_DIR, 'Phase_Overview.md')
for (const file of phaseFiles) {
  const phase = extractNumber(file, 'phase')
  if (phase) {
    urls.push({
      loc: `${BASE_URL}/#/phase/${phase}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: getLastModified(file),
    })
  }
}

// Lesson pages
const lessonFiles = findFiles(LESSONS_DIR, 'README.md')
for (const file of lessonFiles) {
  const day = extractNumber(file, 'day')
  if (day) {
    urls.push({
      loc: `${BASE_URL}/#/lesson/${day}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: getLastModified(file),
    })
  }
}

// Sort for consistency
urls.sort((a, b) => a.loc.localeCompare(b.loc))

// Build XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const outPath = join(ROOT, 'public', 'sitemap.xml')
writeFileSync(outPath, xml)
console.log(`✓ Sitemap written to ${outPath} (${urls.length} URLs)`)
