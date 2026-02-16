/**
 * Shared markdown frontmatter parser.
 *
 * Runtime logic lives in `frontmatter-core.js` so browser code and Node scripts
 * consume the exact same implementation.
 */

import {
  normalizeMarkdownLineEndings as normalizeMarkdownLineEndingsCore,
  parseMarkdown as parseMarkdownCore,
  parseNormalizedMarkdown as parseNormalizedMarkdownCore,
} from './frontmatter-core.js'

export interface Frontmatter {
  [key: string]: string | number | boolean | (string | number)[]
}

export interface ParsedMarkdown {
  frontmatter: Frontmatter
  content: string
}

export function normalizeMarkdownLineEndings(raw: string): string {
  return normalizeMarkdownLineEndingsCore(raw)
}

export function parseNormalizedMarkdown(normalized: string): ParsedMarkdown {
  return parseNormalizedMarkdownCore(normalized)
}

export function parseMarkdown(raw: string): ParsedMarkdown {
  return parseMarkdownCore(raw)
}
