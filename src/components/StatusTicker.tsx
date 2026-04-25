/**
 * StatusTicker — top status row of the navbar chrome.
 *
 * Renders a Bloomberg-terminal-style ticker showing current location,
 * streak, XP, and completion progress. Mono-typed, tabular-numerals,
 * intentionally dense. Pauses (no marquee) by default; this is a
 * static dashboard, not animated text — accessible by default.
 *
 * Pulls live state from existing stores (no new state introduced).
 */

import { useLocation } from 'react-router-dom'
import { useProgressStore } from '../stores/progressStore'
import { useGamificationStore } from '../stores/gamificationStore'
import { getCurriculumMetadata } from '../utils/contentLoader'

function formatPath(pathname: string): string {
  if (pathname === '/') return 'home'
  // /lesson/03 → lesson · 03   /phase/2 → phase · 02
  return pathname
    .replace(/^\/+/, '')
    .split('/')
    .map((seg) => {
      if (/^\d+$/.test(seg)) return seg.padStart(2, '0')
      return seg
    })
    .join(' · ')
}

function streakBlocks(streak: number, max = 7): string {
  const filled = Math.min(streak, max)
  return '■'.repeat(filled) + '□'.repeat(Math.max(0, max - filled))
}

/**
 * Status ticker component displayed at the bottom of the screen,
 * showing the user's progress, current streak, and total XP.
 *
 * @returns {JSX.Element | null} The rendered status ticker or null if on certain paths.
 */
export default function StatusTicker() {
  const { pathname } = useLocation()
  const completedCount = useProgressStore((s) => s.completedLessonsCount())
  const streak = useProgressStore((s) => s.streakDays())
  const xp = useGamificationStore((s) => s.xpTotal)
  const { totalDays } = getCurriculumMetadata()

  return (
    <div className="status-ticker" role="status" aria-live="off" aria-label="Session status">
      <span className="ticker-cell ticker-brand" aria-hidden="true">
        <span className="ticker-dot" />
        coding.mba
      </span>
      <span className="ticker-sep" aria-hidden="true">
        ›
      </span>
      <span className="ticker-cell ticker-path" title="Current path">
        {formatPath(pathname)}
      </span>

      <span className="ticker-spacer" />

      <span className="ticker-cell" title={`${streak}-day streak`}>
        <span className="ticker-label">streak</span>
        <span className="ticker-blocks" aria-hidden="true">
          {streakBlocks(streak)}
        </span>
        <span className="ticker-value">{String(streak).padStart(2, '0')}d</span>
      </span>
      <span className="ticker-cell" title={`${xp} experience points`}>
        <span className="ticker-label">xp</span>
        <span className="ticker-value">{xp.toLocaleString()}</span>
      </span>
      <span className="ticker-cell" title={`${completedCount} of ${totalDays} lessons complete`}>
        <span className="ticker-label">done</span>
        <span className="ticker-value">
          {String(completedCount).padStart(3, '0')}
          <span className="ticker-of">/{totalDays}</span>
        </span>
      </span>
    </div>
  )
}
