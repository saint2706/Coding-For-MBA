import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { runValidation, validateLessonContent } from '../validate-content.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../..')
const TMP_DIR = path.join(ROOT, 'tmp-validate-content')

describe('validate-content.js', () => {
  beforeEach(() => {
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true, force: true })
    }
    fs.mkdirSync(TMP_DIR)
  })

  afterEach(() => {
     if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true, force: true })
    }
  })

  it('validateLessonContent should catch missing frontmatter', () => {
    const rawContent = `Just some text without frontmatter.`
    const errors = validateLessonContent(rawContent, 'README.md')
    expect(errors).toContain('Missing frontmatter block')
  })

  it('validateLessonContent should pass valid frontmatter', () => {
     const validContent = `---
day: 1
title: "Introduction to Python"
phase: 1
difficulty: "beginner"
duration: 45
topics: ["python", "basics"]
---

Here is a sufficient amount of content to pass the length check.
It just needs to be at least 100 characters long, so I am writing enough words here to satisfy that requirement.
This should be plenty.
`
    const errors = validateLessonContent(validContent, 'README.md')
    expect(errors.length).toBe(0)
  })

  it('runValidation should process directory and report errors', () => {
     // Create a mock phase structure
     const phaseDir = path.join(TMP_DIR, 'phase-1')
     fs.mkdirSync(phaseDir)

     const phaseOverviewContent = `---
phase: 1
title: "Phase 1"
description: "Desc"
days: [1, 2]
totalDuration: 90
difficulty: "beginner"
---
Sufficient content... Sufficient content... Sufficient content... Sufficient content... Sufficient content... Sufficient content... Sufficient content... Sufficient content...
`
     fs.writeFileSync(path.join(phaseDir, 'Phase_Overview.md'), phaseOverviewContent)

     const lessonContent = `---
day: 1
title: "Day 1"
phase: 1
difficulty: "beginner"
duration: 45
topics: ["python"]
---
Sufficient content... Sufficient content... Sufficient content... Sufficient content... Sufficient content... Sufficient content... Sufficient content... Sufficient content...
`
     fs.writeFileSync(path.join(phaseDir, 'README.md'), lessonContent)

     // Run validation and mock console to prevent noise
     const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

     // Note: It will fail because day 2 is in Phase Overview but missing in file system
     const result = runValidation(TMP_DIR)

     expect(result).toBe(1)

     consoleLogSpy.mockRestore()
  })
})
