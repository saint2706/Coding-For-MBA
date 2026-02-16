export interface Frontmatter {
  [key: string]: string | number | boolean | (string | number)[]
}

export interface ParsedMarkdown {
  frontmatter: Frontmatter
  content: string
}

export function normalizeMarkdownLineEndings(raw: string): string
export function parseNormalizedMarkdown(normalized: string): ParsedMarkdown
export function parseMarkdown(raw: string): ParsedMarkdown
