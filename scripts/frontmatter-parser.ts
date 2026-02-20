/**
 * Frontmatter Parser (Script Adapter)
 *
 * Adapts the shared frontmatter parsing logic from `src/utils/frontmatter.ts`
 * for use in Node.js scripts (like content validation).
 *
 * Key Responsibilities:
 * - Re-export core parsing functions with script-friendly names.
 * - Bridge the gap between source code structure and build script requirements.
 */

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
