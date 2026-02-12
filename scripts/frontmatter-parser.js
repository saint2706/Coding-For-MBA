import {
  normalizeMarkdownLineEndings,
  parseMarkdown,
  parseNormalizedMarkdown,
} from '../src/utils/frontmatter.ts'

export function parseMarkdownForScripts(raw) {
  return parseMarkdown(raw)
}

export function normalizeLineEndingsForScripts(raw) {
  return normalizeMarkdownLineEndings(raw)
}

export function parseNormalizedMarkdownForScripts(normalized) {
  return parseNormalizedMarkdown(normalized)
}
