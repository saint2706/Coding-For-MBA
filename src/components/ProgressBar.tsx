/**
 * Progress Bar Component
 *
 * Visual indicator of lesson completion status.
 *
 * Key Responsibilities:
 * - Calculate and render a percentage-based fill width.
 * - Animate changes using spring physics.
 * - Display a text label (e.g., "5/10 lessons").
 * - Provide accessible attributes (role="progressbar").
 */

import { motion, useReducedMotion } from 'motion/react'

interface ProgressBarProps {
  completed: number
  total: number
  showLabel?: boolean
}

export default function ProgressBar({ completed, total, showLabel = true }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const prefersReducedMotion = useReducedMotion()

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
        <motion.div
          className="progress-bar-fill"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={
            prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 190, damping: 24 }
          }
        />
      </div>
      {showLabel && (
        <span className="progress-bar-label">
          {completed}/{total} lesson{total !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
