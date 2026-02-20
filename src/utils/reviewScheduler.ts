/**
 * Review Scheduler (SM-2 Algorithm)
 *
 * Implements a modified SM-2 spaced repetition algorithm for scheduling review cards.
 * Determines the next review date based on user performance ratings.
 *
 * Key Responsibilities:
 * - Calculate new intervals and ease factors based on recall quality (Again, Hard, Good, Easy).
 * - Manage scheduling state (repetitions, due dates).
 * - Provide pure functions for state transitions (no side effects).
 */

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

/**
 * Represents the scheduling state for a single review card.
 */
export interface SchedulingState {
  /** Number of successful repetitions */
  repetitions: number
  /** Current interval in days between reviews */
  intervalDays: number
  /** Ease factor multiplier for interval calculation (SM-2 algorithm) */
  easeFactor: number
  /** ISO timestamp when card is next due for review */
  dueAt: string
  /** ISO timestamp of last review, or null if never reviewed */
  lastReviewedAt: string | null
}

const MIN_EASE = 1.3

/**
 * Clamps ease factor to minimum allowed value.
 *
 * @param value - The ease factor value to clamp
 * @returns Clamped ease factor, minimum 1.3
 */
function clampEase(value: number): number {
  return Math.max(MIN_EASE, Number(value.toFixed(2)))
}

/**
 * Adds specified number of days to a base date and returns ISO string.
 *
 * @param baseDate - The starting date
 * @param days - Number of days to add (minimum 1)
 * @returns ISO timestamp string of the future date
 */
function addDays(baseDate: Date, days: number): string {
  const next = new Date(baseDate)
  next.setDate(next.getDate() + Math.max(1, Math.round(days)))
  return next.toISOString()
}

/**
 * Creates initial scheduling state for a new review card.
 *
 * @param now - Current date/time (defaults to now)
 * @returns Initial scheduling state with default values
 */
export function createInitialSchedulingState(now = new Date()): SchedulingState {
  return {
    repetitions: 0,
    intervalDays: 0,
    easeFactor: 2.5,
    dueAt: now.toISOString(),
    lastReviewedAt: null,
  }
}

/**
 * Schedules the next review for a card based on user rating.
 *
 * Implements SM-2-like algorithm with four difficulty levels:
 * - again: Reset to 1 day, decrease ease factor
 * - hard: Small interval increase, slight ease decrease
 * - good: Standard SM-2 intervals (1, 3, then ease-multiplied)
 * - easy: Larger intervals, increase ease factor
 *
 * @param current - Current scheduling state
 * @param rating - User's difficulty rating for the recall
 * @param now - Current date/time (defaults to now)
 * @returns Updated scheduling state with new due date
 */
export function scheduleReview(
  current: SchedulingState,
  rating: ReviewRating,
  now = new Date(),
): SchedulingState {
  const state = { ...current }

  if (rating === 'again') {
    return {
      ...state,
      repetitions: 0,
      intervalDays: 1,
      easeFactor: clampEase(state.easeFactor - 0.2),
      dueAt: addDays(now, 1),
      lastReviewedAt: now.toISOString(),
    }
  }

  if (rating === 'hard') {
    const interval = state.repetitions <= 1 ? 2 : Math.max(2, Math.round(state.intervalDays * 1.2))
    return {
      ...state,
      repetitions: state.repetitions + 1,
      intervalDays: interval,
      easeFactor: clampEase(state.easeFactor - 0.15),
      dueAt: addDays(now, interval),
      lastReviewedAt: now.toISOString(),
    }
  }

  if (rating === 'good') {
    const interval =
      state.repetitions === 0
        ? 1
        : state.repetitions === 1
          ? 3
          : Math.max(3, Math.round(state.intervalDays * state.easeFactor))

    return {
      ...state,
      repetitions: state.repetitions + 1,
      intervalDays: interval,
      easeFactor: clampEase(state.easeFactor),
      dueAt: addDays(now, interval),
      lastReviewedAt: now.toISOString(),
    }
  }

  const interval =
    state.repetitions <= 1
      ? 4
      : Math.max(4, Math.round(state.intervalDays * (state.easeFactor + 0.3)))

  return {
    ...state,
    repetitions: state.repetitions + 1,
    intervalDays: interval,
    easeFactor: clampEase(state.easeFactor + 0.15),
    dueAt: addDays(now, interval),
    lastReviewedAt: now.toISOString(),
  }
}

/**
 * Checks if a review card is currently due.
 *
 * @param dueAt - ISO timestamp string of when card is due
 * @param now - Current date/time (defaults to now)
 * @returns True if the card is due for review
 */
export function isCardDue(dueAt: string, now = new Date()): boolean {
  return new Date(dueAt).getTime() <= now.getTime()
}
