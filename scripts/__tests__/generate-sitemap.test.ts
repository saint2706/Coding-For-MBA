import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../..')
const SCRIPT_PATH = path.join(ROOT, 'scripts/generate-sitemap.js')
const OUT_PATH = path.join(ROOT, 'public/sitemap.xml')

describe('generate-sitemap.js', () => {
  beforeEach(() => {
    if (!fs.existsSync(path.join(ROOT, 'public'))) {
      fs.mkdirSync(path.join(ROOT, 'public'))
    }
    if (fs.existsSync(OUT_PATH)) {
      fs.unlinkSync(OUT_PATH)
    }
  })

  afterEach(() => {
     if (fs.existsSync(OUT_PATH)) {
      fs.unlinkSync(OUT_PATH)
    }
  })

  it('should generate sitemap.xml with correct content', () => {
    execSync(`node ${SCRIPT_PATH}`)

    expect(fs.existsSync(OUT_PATH)).toBe(true)

    const content = fs.readFileSync(OUT_PATH, 'utf-8')

    // Check header
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(content).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    // Check static routes
    expect(content).toContain('<loc>https://saint2706.github.io/Coding-For-MBA/#/</loc>')
    expect(content).toContain('<loc>https://saint2706.github.io/Coding-For-MBA/#/curriculum</loc>')
    expect(content).toContain('<loc>https://saint2706.github.io/Coding-For-MBA/#/exercises</loc>')
    expect(content).toContain('<loc>https://saint2706.github.io/Coding-For-MBA/#/progress</loc>')
    expect(content).toContain('<loc>https://saint2706.github.io/Coding-For-MBA/#/concepts</loc>')
    expect(content).toContain('<loc>https://saint2706.github.io/Coding-For-MBA/#/stats</loc>')
    expect(content).toContain('<loc>https://saint2706.github.io/Coding-For-MBA/#/review</loc>')

    // Phase and lesson tags
    expect(content).toMatch(/<loc>https:\/\/saint2706\.github\.io\/Coding-For-MBA\/#\/phase\/\d+<\/loc>/)
    expect(content).toMatch(/<loc>https:\/\/saint2706\.github\.io\/Coding-For-MBA\/#\/lesson\/\d+<\/loc>/)
  })
})
