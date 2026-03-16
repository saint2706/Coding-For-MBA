import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseMarkdown } from '../src/utils/frontmatter-core.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const LESSONS_DIR = join(ROOT, 'content', 'lessons')
const BASE_URL = process.env.SITE_URL || 'https://saint2706.github.io/Coding-For-MBA'

/** Extract frontmatter `day`, `phase` or `title` value from a markdown file. */
function extractFrontmatter(filePath) {
  const raw = readFileSync(filePath, 'utf-8')
  const { frontmatter } = parseMarkdown(raw)
  return frontmatter
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

const lines = ['# Site Architecture']

// Static pages
lines.push(`- ${BASE_URL}/#/: Home page - Main landing page covering the 108-day Python, Data Science, and SQL curriculum.`)
lines.push(`- ${BASE_URL}/#/curriculum: Curriculum overview - Browse the complete 108-day curriculum roadmap across 9 phases.`)
lines.push(`- ${BASE_URL}/#/exercises: Practice exercises - Hands-on coding exercises and challenges.`)
lines.push(`- ${BASE_URL}/#/progress: Learning progress - Track your curriculum completion and daily streaks.`)
lines.push(`- ${BASE_URL}/#/concepts: Concept graph - Visual map of interrelated technical concepts.`)
lines.push(`- ${BASE_URL}/#/stats: Learning statistics - Detailed analytics on learning duration and performance.`)

// Phase overviews
const phaseFiles = findFiles(LESSONS_DIR, 'Phase_Overview.md')
const phases = []
for (const file of phaseFiles) {
  const fm = extractFrontmatter(file)
  if (fm.phase) {
    phases.push({
      phase: Number(fm.phase),
      title: fm.title || `Phase ${fm.phase}`,
      description: fm.description || `Phase ${fm.phase} covering ${fm.title || 'various topics'}.`
    })
  }
}
phases.sort((a, b) => a.phase - b.phase)

for (const p of phases) {
  lines.push(`- ${BASE_URL}/#/phase/${p.phase}: ${p.title} - ${p.description}`)
}

// Lesson pages
const lessonFiles = findFiles(LESSONS_DIR, 'README.md')
const lessons = []
for (const file of lessonFiles) {
  const fm = extractFrontmatter(file)
  if (fm.day) {
    // Some day values might be strings like "50A" or "bonus", so we treat them as strings for the URL.
    // But for sorting, we parse the numeric part.
    const dayStr = String(fm.day)
    const dayNum = parseFloat(dayStr) || 0
    lessons.push({
      dayStr: dayStr,
      dayNum: dayNum,
      title: fm.title || `Day ${dayStr}`,
      description: fm.description || `Lesson covering ${fm.title || `Day ${dayStr}`}.`
    })
  }
}
lessons.sort((a, b) => a.dayNum - b.dayNum)

for (const l of lessons) {
  lines.push(`- ${BASE_URL}/#/lesson/${l.dayStr}: ${l.title} - ${l.description}`)
}

const llmsTxt = lines.join('\n') + '\n'
const outPath = join(ROOT, 'public', 'llms.txt')
writeFileSync(outPath, llmsTxt)
console.log(`✓ llms.txt written to ${outPath} (${lines.length - 1} entries)`)
