interface ProgressBarProps {
  completed: number
  total: number
  showLabel?: boolean
}

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
          {completed}/{total} lessons
        </span>
      )}
    </div>
  )
}
