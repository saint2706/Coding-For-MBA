import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../frontmatter'
import { parseMarkdownForScripts } from '../../../scripts/frontmatter-parser.ts'

describe('frontmatter parser parity', () => {
  const samples = [
    `---\ntitle: Lesson\nday: 7\nphase: 1\ntags: [python, 101]\n---\nBody`,
    `---\ntitle: Arrays\nprerequisites:\n  - 1\n  - 2\n---\nBody`,
    `---\nconstructor: nope\nprototype: nope\n__proto__: nope\nday: 4\n---\nBody`,
    'No frontmatter content',
    `---\ninvalid-frontmatter\n---\nStill body`,
  ]

  it.each(samples)('returns identical parse output across app and scripts for sample %#', (raw) => {
    const appResult = parseMarkdown(raw)
    const scriptResult = parseMarkdownForScripts(raw)

    expect(scriptResult).toEqual(appResult)
    expect(Object.getPrototypeOf(appResult.frontmatter)).toBeNull()
  })
})
