/**
 * Lesson Code Actions
 *
 * Lesson-level controls for working with all of a lesson's Python code at once.
 *
 * Key Responsibilities:
 * - Extract every runnable `python`/`py` snippet from the lesson's markdown.
 * - Offer a "Copy all snippets" button (via the shared `CopyButton`).
 * - Offer a "Download as .py" button that saves the combined snippets as a file.
 */

import { useCallback, useMemo } from 'react'
import CopyButton from './CopyButton'
import { extractLessonCodeBlocks, joinLessonCodeBlocks } from '../utils/lessonCodeBlocks'
import { toastSuccess } from '../utils/toast'

interface LessonCodeActionsProps {
  /** The lesson's raw markdown content to extract code blocks from. */
  content: string
  /** The lesson's day token, used to name the downloaded file. */
  day: string
}

/**
 * Renders "Copy all snippets" and "Download as .py" buttons for a lesson,
 * combining every Python code block found in its content. Renders nothing
 * if the lesson has no Python code blocks.
 *
 * @param {LessonCodeActionsProps} props - The component properties.
 * @returns {React.ReactElement | null} The rendered controls, or null if there's no code to act on.
 */
export default function LessonCodeActions({ content, day }: LessonCodeActionsProps) {
  const combinedCode = useMemo(() => {
    const blocks = extractLessonCodeBlocks(content)
    return blocks.length > 0 ? joinLessonCodeBlocks(blocks) : ''
  }, [content])

  const handleDownload = useCallback(() => {
    const blob = new Blob([combinedCode], { type: 'text/x-python' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `day-${day}-snippets.py`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    toastSuccess('Downloaded lesson code ✓')
  }, [combinedCode, day])

  if (!combinedCode) return null

  return (
    <div className="lesson-code-actions">
      <CopyButton
        text={combinedCode}
        className="lesson-code-action-btn"
        ariaLabel="Copy all code snippets from this lesson"
        label="Copy all snippets"
        showIcon
      />
      <button
        type="button"
        className="lesson-code-action-btn"
        onClick={handleDownload}
        aria-label="Download all code snippets from this lesson as a .py file"
        title="Download as .py"
      >
        <span aria-hidden="true">⬇</span> Download .py
      </button>
    </div>
  )
}
