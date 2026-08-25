import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateLessonContent } from '../../../scripts/validate-content.js'

const FIXTURES_DIR = path.join(
  import.meta.dirname,
  '..',
  '..',
  '..',
  'scripts',
  '__fixtures__',
  'validate-content',
)

function readFixture(fileName: string) {
  return fs.readFileSync(path.join(FIXTURES_DIR, fileName), 'utf8')
}

describe('validateLessonContent', () => {
  it('validates LF and CRLF fixture content identically', () => {
    const lfErrors = validateLessonContent(readFixture('sample-lf.md'))
    const crlfErrors = validateLessonContent(readFixture('sample-crlf.md'))

    expect(lfErrors).toEqual([])
    expect(crlfErrors).toEqual([])
    expect(crlfErrors).toEqual(lfErrors)
  })

  it('reports no issues for valid lesson schema content', () => {
    const content = `---
day: 7
title: Data Storytelling
phase: 2
difficulty: intermediate
duration: 45
tags: ["communication", "visualization"]
concepts:
  - insight
  - narrative
---
This lesson body contains enough detail to satisfy the minimum body length validation check while also exercising optional array metadata fields.`

    expect(validateLessonContent(content)).toEqual([])
  })

  it('reports readable per-field schema issues for invalid lesson content', () => {
    const content = `---
day: day-one
title:
phase: 0
duration: quick
---
This body is intentionally short.`

    const errors = validateLessonContent(content)

    expect(errors).toEqual(
      expect.arrayContaining([
        'Invalid day: Invalid string: must match pattern /^\\d+[A-Za-z]?$/',
        'Invalid title: Invalid input: expected string, received undefined',
        'Invalid phase: Too small: expected number to be >0',
        'Invalid difficulty: Invalid option: expected one of "beginner"|"intermediate"|"advanced"|"expert"',
        'Invalid duration: Invalid input: expected number, received NaN',
        'Content body is suspiciously short (< 100 chars)',
      ]),
    )
  })

  it('validates phase overview frontmatter with the phase schema', () => {
    const phaseOverview = `---
phase: 3
title: Data Engineering
days: [25, 26, 27]
totalDuration: 180
difficulty: intermediate
---
This phase overview body is intentionally long enough to pass body checks while verifying that phase metadata validation applies for Phase_Overview markdown files.`

    expect(validateLessonContent(phaseOverview, 'Phase_Overview.md')).toEqual([])
  })
})
