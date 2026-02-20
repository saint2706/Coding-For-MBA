/**
 * Frontmatter Parser Facade
 *
 * Provides a unified interface for parsing Markdown Frontmatter, abstracting the
 * underlying implementation which is shared between browser and Node.js environments.
 *
 * Key Responsibilities:
 * - Re-export core parsing logic from `frontmatter-core.js`.
 * - Provide TypeScript interfaces for parsed content.
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

/**
 * Normalizes line endings to LF (\n) to ensure consistent parsing across OSs.
 */
export function normalizeMarkdownLineEndings(raw: string): string {
  return normalizeMarkdownLineEndingsCore(raw)
}

/**
 * Parses markdown that has already been normalized.
 */
export function parseNormalizedMarkdown(normalized: string): ParsedMarkdown {
  return parseNormalizedMarkdownCore(normalized)
}

/**
 * Normalizes and parses raw markdown content.
 */
export function parseMarkdown(raw: string): ParsedMarkdown {
  return parseMarkdownCore(raw)
}
