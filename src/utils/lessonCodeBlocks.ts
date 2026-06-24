/**
 * Lesson Code Block Extraction
 *
 * Pulls runnable Python snippets out of a lesson's raw markdown content for the
 * "Copy all snippets" / "Download as .py" lesson-level actions.
 *
 * Key Responsibilities:
 * - Extract `python`/`py` fenced code blocks, skipping `diff`-flagged fences
 *   (illustrative diffs aren't valid, runnable Python).
 * - Join extracted blocks into a single downloadable/copyable script.
 */

const PYTHON_CODE_FENCE = /```(?:python|py)([^\n]*)\n([\s\S]*?)```/g
const DIFF_KEYWORD = /\bdiff\b/i

/**
 * Extracts all runnable `python`/`py` fenced code blocks from a lesson's markdown
 * content, in document order. Fences flagged as `diff` (e.g. ` ```python diff `)
 * are skipped since they illustrate a change rather than runnable code.
 *
 * @param {string} content - The lesson's raw markdown content.
 * @returns {string[]} The extracted code blocks, trimmed of trailing newlines.
 */
export function extractLessonCodeBlocks(content: string): string[] {
  const blocks: string[] = []
  PYTHON_CODE_FENCE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = PYTHON_CODE_FENCE.exec(content)) !== null) {
    const meta = match[1] ?? ''
    if (DIFF_KEYWORD.test(meta)) continue

    const code = match[2]?.replace(/\n$/, '')
    if (code) blocks.push(code)
  }
  return blocks
}

/**
 * Joins extracted code blocks into a single script, separating each snippet
 * with a numbered comment header.
 *
 * @param {string[]} blocks - The code blocks to join, in document order.
 * @returns {string} The combined script text.
 */
export function joinLessonCodeBlocks(blocks: string[]): string {
  return blocks.map((block, index) => `# --- Snippet ${index + 1} ---\n${block}`).join('\n\n')
}
