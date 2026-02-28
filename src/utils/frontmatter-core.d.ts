export interface Frontmatter {
  [key: string]: string | number | boolean | (string | number)[]
}

export interface ParsedMarkdown {
  frontmatter: Frontmatter
  content: string
}

/**
 * Normalizes line endings in a markdown string to Unix style (LF).
 * This ensures consistent processing regardless of the OS (Windows CRLF vs Unix LF).
 *
 * @param raw - The raw markdown content.
 * @returns The markdown content with all line endings converted to `\n`.
 */
export function normalizeMarkdownLineEndings(raw: string): string

/**
 * Parses frontmatter from a normalized markdown string.
 * Supports basic YAML-like syntax including scalars, arrays, and inline arrays.
 * Blocks unsafe keys like `__proto__`.
 *
 * @param normalized - The markdown content with normalized line endings.
 * @returns An object containing the parsed frontmatter fields and the remaining markdown content.
 */
export function parseNormalizedMarkdown(normalized: string): ParsedMarkdown

/**
 * Parses markdown frontmatter and content from a raw markdown string.
 * Normalizes line endings internally before parsing.
 *
 * @param raw - The raw markdown content.
 * @returns An object containing the parsed frontmatter fields and the remaining markdown content.
 */
export function parseMarkdown(raw: string): ParsedMarkdown
