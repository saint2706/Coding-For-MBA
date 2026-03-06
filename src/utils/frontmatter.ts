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

/**
 * Represents parsed Markdown frontmatter fields.
 */
export interface Frontmatter {
  [key: string]: string | number | boolean | (string | number)[]
}

/**
 * Represents the result of parsing a Markdown string containing frontmatter.
 */
export interface ParsedMarkdown {
  frontmatter: Frontmatter
  content: string
}

/**
 * Normalizes line endings to LF (\n) to ensure consistent parsing across OSs.
 *
 * @param {string} raw - The raw markdown content.
 * @returns {string} The markdown content with Unix style line endings.
 */
export function normalizeMarkdownLineEndings(raw: string): string {
  return normalizeMarkdownLineEndingsCore(raw)
}

/**
 * Parses markdown that has already been normalized.
 *
 * @param {string} normalized - The markdown content with normalized line endings.
 * @returns {ParsedMarkdown} An object containing the parsed frontmatter fields and the remaining markdown content.
 */
export function parseNormalizedMarkdown(normalized: string): ParsedMarkdown {
  return parseNormalizedMarkdownCore(normalized)
}

/**
 * Normalizes and parses raw markdown content.
 *
 * @param {string} raw - The raw markdown content.
 * @returns {ParsedMarkdown} An object containing the parsed frontmatter fields and the remaining markdown content.
 */
export function parseMarkdown(raw: string): ParsedMarkdown {
  return parseMarkdownCore(raw)
}
