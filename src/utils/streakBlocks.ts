/**
 * Renders a streak as a row of filled/unfilled mono block glyphs
 * (e.g. "■■■□□□□" for a 3-day streak against a 7-day max).
 *
 * Shared by StatusTicker (navbar) and the Home hero readout so the
 * "streak as blocks" visual language stays a single implementation.
 */
export function streakBlocks(streak: number, max = 7): string {
  const filled = Math.min(streak, max)
  return '■'.repeat(filled) + '□'.repeat(Math.max(0, max - filled))
}
