import { createSlugger, stripMarkdownInlineFormatting } from './slug'

interface TocEntry {
  id: string
  text: string
  level: number
}

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
