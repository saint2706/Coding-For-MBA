import { describe, expect, it } from 'vitest'
import { parseMarkdown, normalizeMarkdownLineEndings, parseNormalizedMarkdown } from '../frontmatter'
import {
  parseMarkdown as parseMarkdownCore,
  normalizeMarkdownLineEndings as normalizeMarkdownLineEndingsCore,
  parseNormalizedMarkdown as parseNormalizedMarkdownCore,
} from '../frontmatter-core.js'

describe('frontmatter parser parity', () => {
  const samples = [
    `---\ntitle: Lesson\nday: 7\nphase: 1\ntags: [python, 101]\n---\nBody`,
    `---\ntitle: Arrays\nprerequisites:\n  - 1\n  - 2\n---\nBody`,
    `---\nconstructor: nope\nprototype: nope\n__proto__: nope\nday: 4\n---\nBody`,
    'No frontmatter content',
    `---\ninvalid-frontmatter\n---\nStill body`,
  ]

  it.each(samples)('returns identical parse output across app and core for sample %#', (raw) => {
    const appResult = parseMarkdown(raw)
    const coreResult = parseMarkdownCore(raw)

    expect(coreResult).toEqual(appResult)
    expect(Object.getPrototypeOf(appResult.frontmatter)).toBeNull()
  })

  it.each(samples)('normalizeMarkdownLineEndings returns identical output across app and core for sample %#', (raw) => {
    const appResult = normalizeMarkdownLineEndings(raw)
    const coreResult = normalizeMarkdownLineEndingsCore(raw)

    expect(coreResult).toEqual(appResult)
  })

  it.each(samples)('parseNormalizedMarkdown returns identical output across app and core for sample %#', (raw) => {
    // Normalizing first to strictly test parseNormalizedMarkdown.
    const normalizedRaw = normalizeMarkdownLineEndings(raw)

    const appResult = parseNormalizedMarkdown(normalizedRaw)
    const coreResult = parseNormalizedMarkdownCore(normalizedRaw)

    expect(coreResult).toEqual(appResult)
    expect(Object.getPrototypeOf(appResult.frontmatter)).toBeNull()
  })
})
