import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../..')
const SCRIPT_PATH = path.join(ROOT, 'scripts/generate-llms-txt.js')
const OUT_PATH = path.join(ROOT, 'public/llms.txt')

describe('generate-llms-txt.js', () => {
  beforeEach(() => {
    // Ensure public directory exists
    if (!fs.existsSync(path.join(ROOT, 'public'))) {
      fs.mkdirSync(path.join(ROOT, 'public'))
    }
    // Remove output file if it exists to start fresh
    if (fs.existsSync(OUT_PATH)) {
      fs.unlinkSync(OUT_PATH)
    }
  })

  afterEach(() => {
     if (fs.existsSync(OUT_PATH)) {
      fs.unlinkSync(OUT_PATH)
    }
  })

  it('should generate llms.txt with correct static pages', () => {
    execSync(`node ${SCRIPT_PATH}`)

    expect(fs.existsSync(OUT_PATH)).toBe(true)

    const content = fs.readFileSync(OUT_PATH, 'utf-8')

    // Check header
    expect(content).toContain('# Site Architecture')

    // Check static routes
    expect(content).toContain('- https://saint2706.github.io/Coding-For-MBA/#/: Home page')
    expect(content).toContain('- https://saint2706.github.io/Coding-For-MBA/#/curriculum: Curriculum overview')
    expect(content).toContain('- https://saint2706.github.io/Coding-For-MBA/#/exercises: Practice exercises')
    expect(content).toContain('- https://saint2706.github.io/Coding-For-MBA/#/progress: Learning progress')
    expect(content).toContain('- https://saint2706.github.io/Coding-For-MBA/#/concepts: Concept graph')
    expect(content).toContain('- https://saint2706.github.io/Coding-For-MBA/#/stats: Learning statistics')
    expect(content).toContain('- https://saint2706.github.io/Coding-For-MBA/#/search: Search')
    expect(content).toContain('- https://saint2706.github.io/Coding-For-MBA/#/review: Spaced Repetition Review')
    expect(content).toContain('- https://saint2706.github.io/Coding-For-MBA/#/case-studies: Case Studies')
  })
})
