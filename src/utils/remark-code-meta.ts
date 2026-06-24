import { visit } from 'unist-util-visit'
import type { Code, Root } from 'mdast'

const DIFF_KEYWORD = /\bdiff\b/i
const LINE_RANGE_SPEC = /\{([\d,\-\s]+)\}/

/**
 * Expands a `{3,7-9}`-style line range spec into a sorted list of distinct
 * 1-indexed line numbers.
 */
export function parseHighlightLines(spec: string): number[] {
  const lines = new Set<number>()

  for (const part of spec.split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]!, 10)
      const end = parseInt(rangeMatch[2]!, 10)
      const [from, to] = start <= end ? [start, end] : [end, start]
      for (let n = from; n <= to; n++) lines.add(n)
      continue
    }

    if (/^\d+$/.test(trimmed)) {
      lines.add(parseInt(trimmed, 10))
    }
  }

  return Array.from(lines).sort((a, b) => a - b)
}

/**
 * Parses a fenced code block's meta/info string (the text following the
 * language on the opening fence, e.g. ` ```python diff` or ` ```python {3,7-9}`)
 * for the "code block QoL" conventions: a `diff` keyword enabling +/- line
 * coloring, and a `{...}` range enabling line highlighting.
 */
export function remarkCodeMeta() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code) => {
      const meta = node.meta ?? ''

      // A bare ` ```diff ` fence is diff-mode by language alone; ` ```python diff `
      // (or any other language) opts in via the `diff` keyword in the meta string.
      const isDiff = node.lang === 'diff' || DIFF_KEYWORD.test(meta)
      const rangeMatch = meta.match(LINE_RANGE_SPEC)
      const highlightLines = rangeMatch ? parseHighlightLines(rangeMatch[1]!) : []

      if (!isDiff && highlightLines.length === 0) return

      const hProperties: Record<string, string> = {}
      if (isDiff) hProperties.dataDiff = 'true'
      if (highlightLines.length > 0) hProperties.dataHighlightLines = highlightLines.join(',')

      node.data = {
        ...node.data,
        hProperties: {
          ...(node.data?.hProperties as Record<string, unknown> | undefined),
          ...hProperties,
        },
      }
    })
  }
}
