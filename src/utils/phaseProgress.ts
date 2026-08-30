/**
 * Shared phase-completion logic, used by the Sidebar (auto-collapse) and
 * Curriculum page (progress display) so both agree on what "complete" means.
 */

export function isPhaseComplete(completedInPhaseCount: number, totalLessons: number): boolean {
  return totalLessons > 0 && completedInPhaseCount === totalLessons
}
