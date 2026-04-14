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

import { useMemo, useState, useEffect, useCallback } from 'react'
import SEOHead from '../components/SEOHead'
import Breadcrumb from '../components/Breadcrumb'
import {
  getDueReviewCards,
  getReviewStreak,
  rateReviewCard,
  type ReviewCard,
} from '../utils/reviewTracker'
import type { ReviewRating } from '../utils/reviewScheduler'
import { isTypingInEditableElement } from '../utils/shortcuts'

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
 *
 * @returns {JSX.Element} The rendered review page.
 */
export default function Review() {
  const [now, setNow] = useState(() => new Date())
  const [showAnswer, setShowAnswer] = useState(false)
  const dueCards = useMemo(() => getDueReviewCards(now), [now])
  const currentCard: ReviewCard | null = dueCards[0] || null
  const streak = useMemo(() => getReviewStreak(now), [now])

  const handleRate = useCallback(
    (rating: ReviewRating) => {
      if (!currentCard) return
      rateReviewCard(currentCard.id, rating, new Date())
      setShowAnswer(false)
      setNow(new Date())
    },
    [currentCard],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentCard || isTypingInEditableElement(event.target)) return

      if (!showAnswer) {
        if (event.code === 'Space' || event.key === 'Enter') {
          event.preventDefault()
          setShowAnswer(true)
        }
        return
      }

      switch (event.key) {
        case '1':
          handleRate('again')
          break
        case '2':
          handleRate('hard')
          break
        case '3':
          handleRate('good')
          break
        case '4':
          handleRate('easy')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentCard, showAnswer, handleRate])

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
        <h1>Spaced Repetition Review</h1>
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
          <h2>{currentCard.prompt}</h2>
          <p className="review-card-lesson">From: {currentCard.lessonTitle}</p>

          <div aria-live="polite">
            {showAnswer ? (
              <div className="review-answer">
                <strong>Answer guide:</strong>
                <p>{currentCard.answer}</p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="review-answer-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  onClick={() => setShowAnswer(true)}
                >
                  Show Answer
                </button>
                <p className="review-keyboard-hint">
                  <small>
                    Press <kbd>Space</kbd> or <kbd>Enter</kbd> to reveal
                  </small>
                </p>
              </>
            )}
          </div>

          {showAnswer && (
            <>
              <div className="review-actions">
                {(['again', 'hard', 'good', 'easy'] as const).map((rating, index) => (
                  <button
                    key={rating}
                    type="button"
                    className={`review-action-btn review-${rating} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                    onClick={() => handleRate(rating)}
                    title={`Shortcut: ${index + 1}`}
                  >
                    {getRatingLabel(rating)}
                  </button>
                ))}
              </div>
              <p className="review-keyboard-hint">
                <small>
                  Shortcuts: <kbd>1</kbd> Again · <kbd>2</kbd> Hard · <kbd>3</kbd> Good ·{' '}
                  <kbd>4</kbd> Easy
                </small>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
