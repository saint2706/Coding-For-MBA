/**
 * Shared, browser-safe markdown frontmatter parser.
 */

export interface Frontmatter {
  [key: string]: string | number | boolean | (string | number)[]
}

export interface ParsedMarkdown {
  frontmatter: Frontmatter
  content: string
}

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
const FRONTMATTER_START_DELIMITER = '---\n'
const FRONTMATTER_END_DELIMITER = '\n---\n'

function coerceScalar(rawValue: string): string | number | boolean {
  const unquoted = rawValue.replace(/^["']|["']$/g, '')

  if (unquoted === 'true') return true
  if (unquoted === 'false') return false
  if (!isNaN(Number(unquoted)) && unquoted !== '') return Number(unquoted)

  return unquoted
}

export function normalizeMarkdownLineEndings(raw: string): string {
  return raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

export function parseNormalizedMarkdown(normalized: string): ParsedMarkdown {
  if (!normalized.startsWith(FRONTMATTER_START_DELIMITER)) {
    return { frontmatter: Object.create(null), content: normalized }
  }

  const endIndex = normalized.indexOf(FRONTMATTER_END_DELIMITER, FRONTMATTER_START_DELIMITER.length)
  if (endIndex === -1) {
    return { frontmatter: Object.create(null), content: normalized }
  }

  const yamlStr = normalized.slice(FRONTMATTER_START_DELIMITER.length, endIndex)
  const content = normalized.slice(endIndex + FRONTMATTER_END_DELIMITER.length)
  const frontmatter: Frontmatter = Object.create(null)

  let currentKey: string | null = null
  let currentArray: (string | number)[] | null = null

  for (const line of yamlStr.split('\n')) {
    const arrayMatch = line.match(/^\s+-\s+(.+)$/)
    if (arrayMatch && currentKey) {
      if (!currentArray) {
        currentArray = []
        frontmatter[currentKey] = currentArray
      }

      const item = arrayMatch[1]
      if (!item) continue
      const value = item.trim().replace(/^["']|["']$/g, '')
      currentArray.push(isNaN(Number(value)) ? value : Number(value))
      continue
    }

    const kvMatch = line.match(/^(\w+):\s*(.*)$/)
    if (!kvMatch) continue

    const key = kvMatch[1]
    if (!key || BLOCKED_KEYS.has(key)) {
      currentKey = null
      currentArray = null
      continue
    }

    currentKey = key
    currentArray = null

    const kvValue = kvMatch[2]
    if (kvValue === undefined) continue

    const value = kvValue.trim()
    if (value === '') continue

    const inlineArray = value.match(/^\[(.*)\]$/)
    if (inlineArray) {
      const inlineValues = inlineArray[1]
      if (inlineValues === undefined) continue

      frontmatter[currentKey] = inlineValues
        .split(',')
        .map((segment) => segment.trim().replace(/^["']|["']$/g, ''))
        .map((segment) => (isNaN(Number(segment)) ? segment : Number(segment)))
      continue
    }

    frontmatter[currentKey] = coerceScalar(value)
  }

  return { frontmatter, content }
}

export function parseMarkdown(raw: string): ParsedMarkdown {
  return parseNormalizedMarkdown(normalizeMarkdownLineEndings(raw))
}
