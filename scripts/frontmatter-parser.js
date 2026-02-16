/**
 * Script-facing wrappers around the shared frontmatter parser implementation.
 */

import {
  normalizeMarkdownLineEndings,
  parseMarkdown,
  parseNormalizedMarkdown,
} from '../src/utils/frontmatter-core.js'

export function normalizeLineEndingsForScripts(raw) {
  return normalizeMarkdownLineEndings(raw)
}

export function parseNormalizedMarkdownForScripts(normalized) {
  return parseNormalizedMarkdown(normalized)
}

export function parseMarkdownForScripts(raw) {
  return parseMarkdown(raw)
}
