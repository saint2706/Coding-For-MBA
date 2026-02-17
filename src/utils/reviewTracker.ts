import { getAllReviewCardSeeds } from './contentLoader'
import { getStoredJson, removeStoredValue, setStoredString } from './safeStorage'
import {
  createInitialSchedulingState,
  isCardDue,
  scheduleReview,
  type ReviewRating,
  type SchedulingState,
} from './reviewScheduler'

const REVIEW_STORAGE_KEY = 'coding-for-mba-review-state'

interface StoredReviewCard {
  id: string
  state: SchedulingState
}

interface ReviewStateV2 {
  version: 2
  cards: StoredReviewCard[]
}

interface LegacyReviewStateV1 {
  [cardId: string]: SchedulingState
}

export interface ReviewCard extends StoredReviewCard {
  day: number
  phase: number
  lessonTitle: string
  sourceType: 'concept' | 'heading' | 'exercise'
  prompt: string
  answer: string
}

let reviewStateCache: Map<string, SchedulingState> | null = null

function isSchedulingState(value: unknown): value is SchedulingState {
  if (!value || typeof value !== 'object') return false
  const state = value as Record<string, unknown>
  return (
    typeof state.repetitions === 'number' &&
    typeof state.intervalDays === 'number' &&
    typeof state.easeFactor === 'number' &&
    typeof state.dueAt === 'string' &&
    (typeof state.lastReviewedAt === 'string' || state.lastReviewedAt === null)
  )
}

function isReviewStateV2(value: unknown): value is ReviewStateV2 {
  if (!value || typeof value !== 'object') return false
  const payload = value as Record<string, unknown>
  if (payload.version !== 2 || !Array.isArray(payload.cards)) return false
  return payload.cards.every((entry) => {
    if (!entry || typeof entry !== 'object') return false
    const card = entry as Record<string, unknown>
    return typeof card.id === 'string' && isSchedulingState(card.state)
  })
}

function migrateLegacyState(value: unknown): Map<string, SchedulingState> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return new Map()
  const records = Object.entries(value as LegacyReviewStateV1).filter((entry) =>
    isSchedulingState(entry[1]),
  )
  return new Map(records as Array<[string, SchedulingState]>)
}

function loadReviewState(): Map<string, SchedulingState> {
  if (reviewStateCache) return reviewStateCache

  const parsed = getStoredJson<unknown>(REVIEW_STORAGE_KEY, {})
  reviewStateCache = isReviewStateV2(parsed)
    ? new Map(parsed.cards.map((card) => [card.id, card.state]))
    : migrateLegacyState(parsed)

  persistReviewState(reviewStateCache)
  return reviewStateCache
}

function persistReviewState(state: Map<string, SchedulingState>): void {
  const payload: ReviewStateV2 = {
    version: 2,
    cards: [...state.entries()].map(([id, cardState]) => ({ id, state: cardState })),
  }
  reviewStateCache = state
  setStoredString(REVIEW_STORAGE_KEY, JSON.stringify(payload))
}

export function getReviewCards(now = new Date()): ReviewCard[] {
  const stored = loadReviewState()
  const seeds = getAllReviewCardSeeds()

  return seeds.map((seed) => ({
    ...seed,
    state: stored.get(seed.id) || createInitialSchedulingState(now),
  }))
}

export function getDueReviewCards(now = new Date()): ReviewCard[] {
  return getReviewCards(now).filter((card) => isCardDue(card.state.dueAt, now))
}

export function rateReviewCard(
  cardId: string,
  rating: ReviewRating,
  now = new Date(),
): SchedulingState {
  const current = loadReviewState()
  const existing = current.get(cardId) || createInitialSchedulingState(now)
  const updated = scheduleReview(existing, rating, now)
  current.set(cardId, updated)
  persistReviewState(current)
  return updated
}

export function getReviewDueCountByPhase(now = new Date()): Record<number, number> {
  const counts: Record<number, number> = {}
  getDueReviewCards(now).forEach((card) => {
    counts[card.phase] = (counts[card.phase] || 0) + 1
  })
  return counts
}

export function getReviewStreak(now = new Date()): number {
  const reviewedDates = new Set(
    getReviewCards(now)
      .map((card) => card.state.lastReviewedAt)
      .filter((value): value is string => Boolean(value))
      .map((value) => value.slice(0, 10)),
  )

  let streak = 0
  const cursor = new Date(now)
  while (true) {
    const dayKey = cursor.toISOString().slice(0, 10)
    if (!reviewedDates.has(dayKey)) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function clearReviewState(): void {
  reviewStateCache = null
  removeStoredValue(REVIEW_STORAGE_KEY)
}

export const reviewStorageKey = REVIEW_STORAGE_KEY
