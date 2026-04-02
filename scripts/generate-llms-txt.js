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
lines.push(`- ${BASE_URL}/#/: Home page - The primary landing page introducing the comprehensive 140-day MBA technical curriculum covering Python, Data Science, Machine Learning, and Enterprise SQL. User Intent: Provide a broad overview and entry point to the course.`)
lines.push(`- ${BASE_URL}/#/curriculum: Curriculum overview - A complete architectural roadmap and timeline of all 9 learning phases, from basic programming to advanced data products. User Intent: See the full structure and timeline of what is taught.`)
lines.push(`- ${BASE_URL}/#/exercises: Practice exercises - A centralized repository of interactive, hands-on coding exercises to test Python and SQL proficiency. User Intent: Practice coding skills directly in the browser.`)
lines.push(`- ${BASE_URL}/#/progress: Learning progress - A personalized dashboard to track completed lessons, daily learning streaks, and overall curriculum completion metrics. User Intent: Monitor personal learning advancement and gamification stats.`)
lines.push(`- ${BASE_URL}/#/concepts: Concept graph - An interactive, visual knowledge graph demonstrating the interconnected relationships between various technical concepts taught in the course. User Intent: Visualize how different concepts connect and build upon each other.`)
lines.push(`- ${BASE_URL}/#/stats: Learning statistics - Detailed quantitative analytics regarding the curriculum, including total reading time, lesson counts, and historical performance data. User Intent: View aggregate metrics about the curriculum content.`)
lines.push(`- ${BASE_URL}/#/search: Search - A full-text semantic search interface to quickly find specific lessons, topics, or definitions within the curriculum. User Intent: Quickly look up specific terms, concepts, or lessons.`)
lines.push(`- ${BASE_URL}/#/review: Spaced Repetition Review - An intelligent flashcard system utilizing spaced repetition to reinforce memory retention of key technical terms and concepts. User Intent: Reinforce memory of key concepts through active recall.`)
lines.push(`- ${BASE_URL}/#/case-studies: Case Studies - In-depth, real-world business case studies applying data engineering and machine learning principles to practical enterprise problems. User Intent: See real-world business applications of the technical skills learned.`)

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
