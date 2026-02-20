/**
 * Spaced Repetition Review Page
 *
 * This page provides a spaced repetition review system for reinforcing learning.
 * It displays review cards that are due based on an SM-2-like scheduling algorithm,
 * allows users to reveal answers, and rate their recall difficulty. The page also
 * shows current review streak and total due cards count.
 *
 * @module pages/Review
 */

import { useMemo, useState } from 'react'
import SEOHead from '../components/SEOHead'
import Breadcrumb from '../components/Breadcrumb'
import {
  getDueReviewCards,
  getReviewStreak,
  rateReviewCard,
  type ReviewCard,
} from '../utils/reviewTracker'
import type { ReviewRating } from '../utils/reviewScheduler'

function getRatingLabel(rating: ReviewRating): string {
  return rating.charAt(0).toUpperCase() + rating.slice(1)
}

/**
 * Spaced Repetition Review Page
 *
 * An interactive flashcard interface for reviewing concepts.
 *
 * Key Responsibilities:
 * - Fetch due cards from the review store.
 * - Display cards one by one (Front -> Reveal -> Rate).
 * - Handle user ratings (Again/Hard/Good/Easy) to update schedules.
 * - Show daily streak and total due count.
 */

export default function Review() {
  const [now, setNow] = useState(() => new Date())
  const [showAnswer, setShowAnswer] = useState(false)
  const dueCards = useMemo(() => getDueReviewCards(now), [now])
  const currentCard: ReviewCard | null = dueCards[0] || null
  const streak = useMemo(() => getReviewStreak(now), [now])

  const handleRate = (rating: ReviewRating) => {
    if (!currentCard) return
    rateReviewCard(currentCard.id, rating, new Date())
    setShowAnswer(false)
    setNow(new Date())
  }

  return (
    <div className="page-container review-page">
      <SEOHead
        title="Review"
        description="Reinforce your learning with spaced repetition review cards. Track your streak and master the Coding for MBA curriculum."
        path="/review"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Review', url: '/review' },
        ]}
      />

      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Review' }]} />

      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <h2>Spaced Repetition Review</h2>
        <p>
          Due cards: {dueCards.length} · Streak: {streak} day(s)
        </p>
      </div>

      {!currentCard ? (
        <div className="progress-stats-card">
          <p>No cards are due right now. Great job!</p>
        </div>
      ) : (
        <div className="review-card">
          <div className="review-card-meta">
            <span>
              Phase {currentCard.phase} · Day {currentCard.day}
            </span>
            <span>{currentCard.sourceType}</span>
          </div>
          <h3>{currentCard.prompt}</h3>
          <p className="review-card-lesson">From: {currentCard.lessonTitle}</p>

          {showAnswer ? (
            <div className="review-answer">
              <strong>Answer guide:</strong>
              <p>{currentCard.answer}</p>
            </div>
          ) : (
            <button type="button" className="review-answer-btn" onClick={() => setShowAnswer(true)}>
              Show Answer
            </button>
          )}

          <div className="review-actions">
            {(['again', 'hard', 'good', 'easy'] as const).map((rating) => (
              <button
                key={rating}
                type="button"
                className={`review-action-btn review-${rating}`}
                onClick={() => handleRate(rating)}
              >
                {getRatingLabel(rating)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
