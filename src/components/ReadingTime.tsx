/**
 * Reading Time Indicator
 *
 * Calculates and displays the estimated reading time for a lesson.
 *
 * Key Responsibilities:
 * - Process raw markdown content to estimate word count.
 * - Display time in a "min read" format with an icon.
 */

import { getReadingTime } from '../utils/contentLoader'

/**
 * Reading Time Indicator Component
 *
 * Calculates and displays the estimated reading time for a lesson.
 *
 * @param {Object} props - The component props.
 * @param {string} props.content - The raw markdown content of the lesson.
 * @returns {JSX.Element} A badge displaying the estimated reading time.
 */
export default function ReadingTime({ content }: { content: string }) {
  const minutes = getReadingTime(content)
  return (
    <span
      className="meta-pill reading-time"
      title={`Estimated reading time: ${minutes} minute${minutes !== 1 ? 's' : ''}`}
    >
      <span aria-hidden="true">📖</span> {minutes} min read
    </span>
  )
}
