/**
 * Structural linting for interactive Markdown blocks (`### Exercise N` /
 * `### Question N`). Mirrors the heading/boundary and label-detection rules
 * that `findInteractiveBlocks` (src/components/MarkdownRenderer.tsx) relies
 * on to parse exercises and mastery-check questions, so authoring mistakes
 * that would otherwise silently render as an empty Goal/code/answer panel
 * get surfaced instead. The code-block check accepts Python as well as the
 * other languages exercises legitimately use (SQL, shell, Docker, config
 * formats, etc.) — see NON_PYTHON_CODE_LANGS.
 */

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'

function getInlineNodeText(node) {
  if (!node) return ''
  if (node.type === 'text' || node.type === 'inlineCode') return node.value
  if (Array.isArray(node.children)) {
    return node.children.map((child) => getInlineNodeText(child)).join('')
  }
  return ''
}

function getHeadingText(node) {
  return node.children
    .map((child) => getInlineNodeText(child))
    .join('')
    .trim()
}

/**
 * Fenced code languages accepted in place of `python`/`py` for an exercise's
 * code block. Many exercises are legitimately about another stack entirely
 * (SQL phases, shell/CLI workflows, Dockerfiles, config files) — requiring
 * Python there would be wrong, not just strict.
 */
const NON_PYTHON_CODE_LANGS = new Set([
  'sql',
  'bash',
  'sh',
  'shell',
  'zsh',
  'powershell',
  'ps1',
  'cmd',
  'batch',
  'text',
  'txt',
  'plaintext',
  'json',
  'yaml',
  'yml',
  'toml',
  'ini',
  'html',
  'css',
  'javascript',
  'js',
  'jsx',
  'typescript',
  'ts',
  'tsx',
  'dockerfile',
  'docker',
  'hcl',
  'csv',
  'xml',
  'graphql',
  'mermaid',
  'gitignore',
])

function isLabeledParagraph(node, label) {
  if (!node || node.type !== 'paragraph') return false
  const first = node.children[0]
  if (!first || first.type !== 'strong') return false

  const strongText = first.children
    .map((child) => getInlineNodeText(child))
    .join('')
    .trim()
    .replace(/:$/, '')

  return strongText.toLowerCase() === label.toLowerCase()
}

/**
 * @typedef {Object} StructuralIssue
 * @property {'exercise' | 'mastery'} type
 * @property {string} heading - The full heading text (e.g. "Exercise 1: Report Scheduler").
 * @property {number | null} line - 1-based source line of the heading, if available.
 * @property {string} message - Human-readable description of the missing structure.
 */

/**
 * Scans a lesson's Markdown body for `### Exercise N` and `### Question N`
 * sections that are missing the structural pieces `findInteractiveBlocks`
 * expects (a `**Goal**` paragraph + code block for exercises, a `<details>`
 * answer block for questions).
 *
 * @param {string} content - The Markdown body to scan (frontmatter stripped).
 * @returns {StructuralIssue[]} Issues found, in document order.
 */
export function findStructuralIssues(content) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(content)
  const topLevelNodes = tree.children
  const issues = []

  for (let i = 0; i < topLevelNodes.length; i++) {
    const node = topLevelNodes[i]
    if (!node || node.type !== 'heading' || node.depth !== 3) continue

    const headingText = getHeadingText(node)
    const exerciseMatch = headingText.match(/^Exercise\s+\d+\s*:\s*(.+)$/i)
    const questionMatch = headingText.match(/^Question\s+\d+\s*:\s*(.+)$/i)
    if (!exerciseMatch && !questionMatch) continue

    const line = node.position?.start?.line ?? null

    let boundaryIndex = topLevelNodes.length
    for (let j = i + 1; j < topLevelNodes.length; j++) {
      const candidate = topLevelNodes[j]
      if (!candidate) continue
      if (candidate.type === 'heading' && candidate.depth <= 3) {
        boundaryIndex = j
        break
      }
    }
    const sectionNodes = topLevelNodes.slice(i + 1, boundaryIndex)

    if (exerciseMatch) {
      const hasGoal = sectionNodes.some((sectionNode) => isLabeledParagraph(sectionNode, 'Goal'))
      const hasCode = sectionNodes.some((sectionNode) => {
        if (sectionNode.type !== 'code') return false
        const lang = sectionNode.lang?.toLowerCase()
        return lang === 'python' || lang === 'py' || NON_PYTHON_CODE_LANGS.has(lang)
      })

      if (!hasGoal) {
        issues.push({
          type: 'exercise',
          heading: headingText,
          line,
          message: `"${headingText}" is missing a **Goal** paragraph`,
        })
      }
      if (!hasCode) {
        issues.push({
          type: 'exercise',
          heading: headingText,
          line,
          message: `"${headingText}" is missing a code block`,
        })
      }
      continue
    }

    const hasDetails = sectionNodes.some(
      (sectionNode) => sectionNode.type === 'html' && /<details[\s>]/i.test(sectionNode.value),
    )
    if (!hasDetails) {
      issues.push({
        type: 'mastery',
        heading: headingText,
        line,
        message: `"${headingText}" is missing a <details> answer block`,
      })
    }
  }

  return issues
}
