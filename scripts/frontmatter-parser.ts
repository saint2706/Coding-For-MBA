import { parseMarkdown } from '../src/utils/frontmatter.ts'

export function parseMarkdownForScripts(raw: string) {
  return parseMarkdown(raw)
}
