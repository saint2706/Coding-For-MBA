/**
 * Table of Contents Parser
 *
 * Scans markdown content to generate a hierarchical table of contents.
 *
 * Key Responsibilities:
 * - Identify and extract H2 and H3 headings.
 * - Generate unique IDs/slugs for anchor linking.
 * - Ignore code blocks to prevent false positives.
 */

import { createSlugger, stripMarkdownInlineFormatting } from './slug'

interface TocEntry {
  id: string
  text: string
  level: number
}

/**
 * Parses markdown content to extract H2 and H3 headings for a Table of Contents.
 * Ignores headings inside code blocks and generates unique URL-safe anchor IDs.
 *
 * @param {string} content - The markdown text to parse.
 * @returns {TocEntry[]} An array of extracted headings with their text, level, and anchor ID.
 */
export function parseHeadings(content: string): TocEntry[] {
  const entries: TocEntry[] = []
  const lines = content.split('\n')
  let inCodeBlock = false
  const slugger = createSlugger()

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      const level = match[1]!.length
      const text = stripMarkdownInlineFormatting(match[2]!)
      const id = slugger.slug(text)

      if (level >= 2 && level <= 3) {
        entries.push({ id, text, level })
      }
    }
  }

  return entries
}
