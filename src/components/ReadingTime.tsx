/**
 * ReadingTime Component
 *
 * Displays an estimated reading time for content based on word count.
 */

import { getReadingTime } from '../utils/contentLoader'

/**
 * Reading time estimator component.
 *
 * Calculates and displays estimated reading time for the given content
 * as a styled pill badge with book icon.
 *
 * @param content - Text content to calculate reading time for
 * @returns A reading time indicator badge
 */
export default function ReadingTime({ content }: { content: string }) {
  const minutes = getReadingTime(content)
  return (
    <span
      className="meta-pill reading-time"
      title={`Estimated reading time: ${minutes} minute${minutes !== 1 ? 's' : ''}`}
    >
      📖 {minutes} min read
    </span>
  )
}
