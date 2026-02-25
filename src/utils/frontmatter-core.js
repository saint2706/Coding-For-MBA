/**
 * Frontmatter Core Utilities
 *
 * Provides safe, lightweight frontmatter parsing for markdown content.
 * This module is designed to work in both Node.js (scripts) and browser environments.
 * It avoids heavy dependencies like `js-yaml` in favor of a custom, restrictive parser.
 */

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
const FRONTMATTER_START_DELIMITER = '---\n'
const FRONTMATTER_END_DELIMITER = '\n---\n'

function coerceScalar(rawValue) {
  const unquoted = rawValue.replace(/^["']|["']$/g, '')

  if (unquoted === 'true') return true
  if (unquoted === 'false') return false
  if (!isNaN(Number(unquoted)) && unquoted !== '') return Number(unquoted)

  return unquoted
}

/**
 * Normalizes line endings in a markdown string to Unix style (LF).
 * This ensures consistent processing regardless of the OS (Windows CRLF vs Unix LF).
 *
 * @param {string} raw - The raw markdown content.
 * @returns {string} The markdown content with all line endings converted to `\n`.
 */
export function normalizeMarkdownLineEndings(raw) {
  return raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

/**
 * Parses frontmatter from a normalized markdown string.
 * Supports basic YAML-like syntax including scalars, arrays, and inline arrays.
 * Blocks unsafe keys like `__proto__`.
 *
 * @param {string} normalized - The markdown content with normalized line endings.
 * @returns {{ frontmatter: Record<string, any>, content: string }} An object containing the parsed frontmatter fields and the remaining markdown content.
 */
export function parseNormalizedMarkdown(normalized) {
  if (!normalized.startsWith(FRONTMATTER_START_DELIMITER)) {
    return { frontmatter: Object.create(null), content: normalized }
  }

  const endIndex = normalized.indexOf(FRONTMATTER_END_DELIMITER, FRONTMATTER_START_DELIMITER.length)
  if (endIndex === -1) {
    return { frontmatter: Object.create(null), content: normalized }
  }

  const yamlStr = normalized.slice(FRONTMATTER_START_DELIMITER.length, endIndex)
  const content = normalized.slice(endIndex + FRONTMATTER_END_DELIMITER.length)
  const frontmatter = Object.create(null)

  let currentKey = null
  let currentArray = null

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

export function parseMarkdown(raw) {
  return parseNormalizedMarkdown(normalizeMarkdownLineEndings(raw))
}
