/**
 * Formats a `YYYY-MM-DD` completion date as a coarse relative label.
 *
 * Completion dates only carry day-level granularity (see `progressStore`'s
 * `completionDates`), so this never fabricates hour/minute precision —
 * anything older than a week falls back to the literal date.
 */
export function formatRelativeDayLabel(dateKey: string, now: Date = new Date()): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  if (!year || !month || !day) return dateKey

  const completed = new Date(year, month - 1, day)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((today.getTime() - completed.getTime()) / 86_400_000)

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`
  return dateKey
}
