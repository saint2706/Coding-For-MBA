import {
  normalizeMarkdownLineEndings,
  parseMarkdown,
  parseNormalizedMarkdown,
} from '../src/utils/frontmatter.ts'

export function parseMarkdownForScripts(raw: string) {
  return parseMarkdown(raw)
}

export function normalizeLineEndingsForScripts(raw: string) {
  return normalizeMarkdownLineEndings(raw)
}

export function parseNormalizedMarkdownForScripts(normalized: string) {
  return parseNormalizedMarkdown(normalized)
}
