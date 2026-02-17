/**
 * Review Tracker Module
 *
 * Manages persistent storage and state tracking for spaced repetition review cards.
 * Handles localStorage persistence with versioned schema, migration from legacy formats,
 * in-memory caching, and provides APIs for querying due cards, rating cards, computing
 * statistics, and managing review state.
 */

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

/**
 * Stored review card entry with ID and scheduling state.
 */
interface StoredReviewCard {
  id: string
  state: SchedulingState
}

/**
 * Current review state schema (version 2).
 */
interface ReviewStateV2 {
  version: 2
  cards: StoredReviewCard[]
}

/**
 * Legacy review state schema (version 1) for migration.
 */
interface LegacyReviewStateV1 {
  [cardId: string]: SchedulingState
}

/**
 * Full review card data including seed metadata and scheduling state.
 */
export interface ReviewCard extends StoredReviewCard {
  day: number
  phase: number
  lessonTitle: string
  sourceType: 'concept' | 'heading' | 'exercise'
  prompt: string
  answer: string
}

let reviewStateCache: Map<string, SchedulingState> | null = null

// Invalidate cache when storage is updated in another tab
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.storageArea !== window.localStorage) return
    if (event.key === null || event.key === REVIEW_STORAGE_KEY) {
      reviewStateCache = null
    }
  })
}

/**
 * Type guard to validate if a value is a valid SchedulingState.
 *
 * @param value - Value to check
 * @returns True if value is a valid SchedulingState
 */
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

/**
 * Type guard to validate if a value is a valid ReviewStateV2.
 *
 * @param value - Value to check
 * @returns True if value is a valid ReviewStateV2
 */
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

/**
 * Migrates legacy v1 state format to current Map structure.
 *
 * @param value - Potential legacy state object
 * @returns Map of card IDs to scheduling states
 */
function migrateLegacyState(value: unknown): Map<string, SchedulingState> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return new Map()
  const records = Object.entries(value as LegacyReviewStateV1).filter((entry) =>
    isSchedulingState(entry[1]),
  )
  return new Map(records as Array<[string, SchedulingState]>)
}

/**
 * Loads review state from cache or localStorage.
 *
 * @returns Map of card IDs to scheduling states
 */
function loadReviewState(): Map<string, SchedulingState> {
  if (reviewStateCache) return reviewStateCache

  const parsed = getStoredJson<unknown>(REVIEW_STORAGE_KEY, {})
  reviewStateCache = isReviewStateV2(parsed)
    ? new Map(parsed.cards.map((card) => [card.id, card.state]))
    : migrateLegacyState(parsed)

  persistReviewState(reviewStateCache)
  return reviewStateCache
}

/**
 * Persists review state to localStorage and updates cache.
 *
 * @param state - Map of card IDs to scheduling states
 */
function persistReviewState(state: Map<string, SchedulingState>): void {
  const payload: ReviewStateV2 = {
    version: 2,
    cards: [...state.entries()].map(([id, cardState]) => ({ id, state: cardState })),
  }
  reviewStateCache = state
  setStoredString(REVIEW_STORAGE_KEY, JSON.stringify(payload))
}

/**
 * Retrieves all review cards with their current scheduling state.
 *
 * @param now - Current date/time (defaults to now)
 * @returns Array of all review cards
 */
export function getReviewCards(now = new Date()): ReviewCard[] {
  const stored = loadReviewState()
  const seeds = getAllReviewCardSeeds()

  return seeds.map((seed) => ({
    ...seed,
    state: stored.get(seed.id) || createInitialSchedulingState(now),
  }))
}

/**
 * Retrieves review cards that are currently due for review.
 *
 * @param now - Current date/time (defaults to now)
 * @returns Array of due review cards
 */
export function getDueReviewCards(now = new Date()): ReviewCard[] {
  return getReviewCards(now).filter((card) => isCardDue(card.state.dueAt, now))
}

/**
 * Records a user rating for a review card and updates its scheduling state.
 *
 * @param cardId - Unique identifier for the review card
 * @param rating - User's difficulty rating (again, hard, good, easy)
 * @param now - Current date/time (defaults to now)
 * @returns Updated scheduling state for the card
 */
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

/**
 * Counts due review cards grouped by phase number.
 *
 * @param now - Current date/time (defaults to now)
 * @returns Object mapping phase numbers to count of due cards
 */
export function getReviewDueCountByPhase(now = new Date()): Record<number, number> {
  const counts: Record<number, number> = {}
  getDueReviewCards(now).forEach((card) => {
    counts[card.phase] = (counts[card.phase] || 0) + 1
  })
  return counts
}

/**
 * Computes the current review streak (consecutive days with reviews).
 * Uses local date calculations to avoid timezone issues.
 *
 * @param now - Current date/time (defaults to now)
 * @returns Number of consecutive days with completed reviews
 */
export function getReviewStreak(now = new Date()): number {
  // Helper to format date as YYYY-MM-DD in local timezone
  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const reviewedDates = new Set(
    getReviewCards(now)
      .map((card) => card.state.lastReviewedAt)
      .filter((value): value is string => Boolean(value))
      .map((value) => toLocalDateString(new Date(value))),
  )

  let streak = 0
  const cursor = new Date(now)
  while (true) {
    const dayKey = toLocalDateString(cursor)
    if (!reviewedDates.has(dayKey)) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/**
 * Clears all review state from localStorage and cache.
 */
export function clearReviewState(): void {
  reviewStateCache = null
  removeStoredValue(REVIEW_STORAGE_KEY)
}

export const reviewStorageKey = REVIEW_STORAGE_KEY
