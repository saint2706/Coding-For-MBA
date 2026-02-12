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
})
