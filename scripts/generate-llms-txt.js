/**
 * GEO (Generative Engine Optimization) - llms.txt Generator
 *
 * Scans the content/lessons directory and generates a structured `llms.txt` file
 * for AI agents to easily digest the site architecture and curriculum.
 *
 * Usage: node scripts/generate-llms-txt.js
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseMarkdown } from '../src/utils/frontmatter-core.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const LESSONS_DIR = join(ROOT, 'content', 'lessons')
const OUT_PATH = join(ROOT, 'public', 'llms.txt')
const BASE_URL = process.env.SITE_URL || 'https://saint2706.github.io/Coding-For-MBA'

// Helper: Extract frontmatter
function extractFrontmatter(filePath) {
  try {
    const raw = readFileSync(filePath, 'utf-8')
    const { frontmatter } = parseMarkdown(raw)
    return frontmatter
  } catch (err) {
    console.warn(`Warning: Failed to parse ${filePath}`, err.message)
    return {}
  }
}

// Helper: Find files recursively
function findFiles(dir, filename) {
  const results = []
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...findFiles(fullPath, filename))
      } else if (entry.name === filename) {
        results.push(fullPath)
      }
    }
  } catch (e) {
    // Ignore errors for non-existent dirs
  }
  return results
}

// Data collection
const phases = []
const lessons = []

// 1. Collect Phases
const phaseFiles = findFiles(LESSONS_DIR, 'Phase_Overview.md')
for (const file of phaseFiles) {
  const fm = extractFrontmatter(file)
  if (fm.phase) {
    phases.push({
      phase: Number(fm.phase),
      title: fm.title || `Phase ${fm.phase}`,
      description: fm.description || '',
      days: fm.days || [] // Usually an array of day references
    })
  }
}
phases.sort((a, b) => a.phase - b.phase)

// 2. Collect Lessons
const lessonFiles = findFiles(LESSONS_DIR, 'README.md')
for (const file of lessonFiles) {
  const fm = extractFrontmatter(file)
  if (fm.day) {
    lessons.push({
      day: fm.day,
      title: fm.title || `Day ${fm.day}`,
      phase: Number(fm.phase) || 0,
      description: fm.description || '',
      concepts: fm.concepts || []
    })
  }
}
lessons.sort((a, b) => {
  const dayA = parseFloat(a.day) || 999
  const dayB = parseFloat(b.day) || 999
  return dayA - dayB
})

// 3. Build Content
let content = `# Coding for MBA

> A structured 108-day curriculum covering Python, Data Science, Machine Learning, Business Intelligence, and Enterprise SQL — designed for MBA professionals.

## Site Architecture

- [Home](${BASE_URL}/#/)
- [Curriculum](${BASE_URL}/#/curriculum)
- [Interactive Exercises](${BASE_URL}/#/exercises)
- [Concepts Graph](${BASE_URL}/#/concepts)
- [Review](${BASE_URL}/#/review)
- [Stats](${BASE_URL}/#/stats)

## Key Concepts

- Python Programming
- Data Science (Pandas, NumPy)
- Machine Learning (Scikit-Learn)
- Business Intelligence
- SQL & Data Engineering

## Curriculum Structure

`

// Add Phases
for (const phase of phases) {
  content += `### [Phase ${phase.phase}: ${phase.title}](${BASE_URL}/#/phase/${phase.phase})\n`
  if (phase.description) {
    content += `> ${phase.description}\n`
  }
  content += '\n'

  // Add Lessons for this phase
  const phaseLessons = lessons.filter(l => l.phase === phase.phase)
  if (phaseLessons.length > 0) {
    content += `**Lessons:**\n`
    for (const lesson of phaseLessons) {
      content += `- [Day ${lesson.day}: ${lesson.title}](${BASE_URL}/#/lesson/${lesson.day})\n`
      if (lesson.concepts && lesson.concepts.length > 0) {
        content += `  - Concepts: ${lesson.concepts.join(', ')}\n`
      }
    }
  }
  content += '\n'
}

// Write file
writeFileSync(OUT_PATH, content)
console.log(`✓ Generated llms.txt with ${phases.length} phases and ${lessons.length} lessons.`)
