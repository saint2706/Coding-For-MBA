/**
 * ProgressBar Component
 * 
 * A visual progress indicator showing completion status with
 * a filled bar and optional label.
 */

/**
 * Props for the ProgressBar component.
 * 
 * @property completed - Number of completed items
 * @property total - Total number of items
 * @property showLabel - Whether to show the text label (default: true)
 */
interface ProgressBarProps {
  completed: number
  total: number
  showLabel?: boolean
}

/**
 * Progress bar component with percentage fill and label.
 * 
 * Displays a horizontal bar filled proportionally to show progress,
 * with optional text label showing "X/Y lessons" format.
 * Includes proper ARIA attributes for accessibility.
 * 
 * @param completed - Number of completed lessons
 * @param total - Total number of lessons
 * @param showLabel - Whether to display the completion count
 * @returns A progress bar component
 */
export default function ProgressBar({ completed, total, showLabel = true }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div
      className="progress-bar-wrapper"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${completed} of ${total} lessons completed`}
    >
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className="progress-bar-label">
          {completed}/{total} lesson{total !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
