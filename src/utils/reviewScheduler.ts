export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

export interface SchedulingState {
  repetitions: number
  intervalDays: number
  easeFactor: number
  dueAt: string
  lastReviewedAt: string | null
}

const MIN_EASE = 1.3

function clampEase(value: number): number {
  return Math.max(MIN_EASE, Number(value.toFixed(2)))
}

function addDays(baseDate: Date, days: number): string {
  const next = new Date(baseDate)
  next.setDate(next.getDate() + Math.max(1, Math.round(days)))
  return next.toISOString()
}

export function createInitialSchedulingState(now = new Date()): SchedulingState {
  return {
    repetitions: 0,
    intervalDays: 0,
    easeFactor: 2.5,
    dueAt: now.toISOString(),
    lastReviewedAt: null,
  }
}

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

export function isCardDue(dueAt: string, now = new Date()): boolean {
  return new Date(dueAt).getTime() <= now.getTime()
}
