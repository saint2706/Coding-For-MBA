/**
 * Mastery Check Component
 *
 * A self-assessment widget embedded in lessons to test understanding.
 *
 * Key Responsibilities:
 * - Display a question and optional code snippet.
 * - Offer a "Check Answer" button to reveal the explanation.
 * - Support interactive code execution via `CodePlayground` if applicable.
 * - Let the learner self-rate "Got it" / "Review again", persisted per-lesson
 *   via `masteryStore` so mastery status survives across visits.
 */

import { useState, useId } from 'react'
import { CaretDown, CheckCircle, ThumbsUp, ArrowClockwise } from '@phosphor-icons/react'
import CodePlayground from './CodePlayground'
import { MarkdownFragment } from './MarkdownFragment'
import { buildFAQSchema } from '../utils/seoSchemas'
import { useMasteryStore, type MasteryStatus } from '../stores/masteryStore'

interface MasteryCheckProps {
  questionNumber: number
  title: string
  questionText: string
  codeSnippet?: string
  answer: string
  lessonId?: string | number
}

/**
 * Mastery Check Component
 *
 * A self-assessment widget embedded in lessons to test understanding.
 *
 * @param {MasteryCheckProps} props - The component props.
 * @param {number} props.questionNumber - The question sequence number.
 * @param {string} props.title - The title of the mastery check.
 * @param {string} props.questionText - The main question description text.
 * @param {string} [props.codeSnippet] - Optional runnable code snippet for the question.
 * @param {string} props.answer - The answer explanation.
 * @param {string | number} [props.lessonId] - The lesson's day token, used to persist
 *   self-assessment status. Without it, status is tracked in local component state only.
 * @returns {JSX.Element} The interactive mastery check widget.
 */
export default function MasteryCheck({
  questionNumber,
  title,
  questionText,
  codeSnippet,
  answer,
  lessonId,
}: MasteryCheckProps) {
  const [revealed, setRevealed] = useState(false)
  const [localStatus, setLocalStatus] = useState<MasteryStatus | null>(null)
  const answerId = useId()

  const storedStatus = useMasteryStore((state) =>
    lessonId !== undefined ? state.getQuestionStatus(lessonId, questionNumber) : null,
  )
  const status = lessonId !== undefined ? storedStatus : localStatus

  const handleSetStatus = (next: MasteryStatus) => {
    if (lessonId !== undefined) {
      useMasteryStore.getState().setQuestionStatus(lessonId, questionNumber, next)
    } else {
      setLocalStatus(next)
    }
  }

  // Check if the answer contains Python code (look for code blocks)
  const hasRunnableCode = codeSnippet && codeSnippet.trim().length > 0
  const faqSchema = buildFAQSchema([{ question: title, answer: answer }])

  return (
    <div className={`mastery-check ${revealed ? 'mastery-check--revealed' : ''}`}>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema).replace(/</g, '\\u003c')}
      </script>
      <div className="mastery-check__header">
        <span className="mastery-check__badge">Q{questionNumber}</span>
        <h3 className="mastery-check__title">{title}</h3>
        {status && (
          <span
            className={`mastery-check__status mastery-check__status--${status}`}
            aria-label={status === 'got-it' ? 'Marked as mastered' : 'Marked for review'}
          >
            {status === 'got-it' ? '✓ Mastered' : '↻ Review again'}
          </span>
        )}
      </div>

      <div className="mastery-check__question">
        <MarkdownFragment content={questionText} />
      </div>

      {hasRunnableCode && (
        <div className="mastery-check__playground">
          <CodePlayground initialCode={codeSnippet} />
        </div>
      )}

      <button
        type="button"
        className={`mastery-check__check-btn ${revealed ? 'mastery-check__check-btn--revealed' : ''}`}
        onClick={() => setRevealed((r) => !r)}
        aria-expanded={revealed}
        aria-label={revealed ? 'Hide Answer' : 'Show Answer'}
        {...(revealed && { 'aria-controls': answerId })}
      >
        {revealed ? (
          <>
            <CaretDown aria-hidden="true" /> Hide Answer
          </>
        ) : (
          <>
            <CheckCircle aria-hidden="true" /> Check Answer
          </>
        )}
      </button>

      {revealed && (
        <div
          id={answerId}
          role="region"
          aria-label="Answer Explanation"
          className="mastery-check__answer"
        >
          <div className="mastery-check__answer-label">Answer</div>
          <div className="mastery-check__answer-body">
            <MarkdownFragment content={answer} />
          </div>

          <div className="mastery-check__self-assess" role="group" aria-label="Self-assessment">
            <span className="mastery-check__self-assess-prompt">How did you do?</span>
            <button
              type="button"
              className={`mastery-check__assess-btn mastery-check__assess-btn--got-it ${status === 'got-it' ? 'mastery-check__assess-btn--active' : ''}`}
              onClick={() => handleSetStatus('got-it')}
              aria-pressed={status === 'got-it'}
            >
              <ThumbsUp aria-hidden="true" /> Got it
            </button>
            <button
              type="button"
              className={`mastery-check__assess-btn mastery-check__assess-btn--review-again ${status === 'review-again' ? 'mastery-check__assess-btn--active' : ''}`}
              onClick={() => handleSetStatus('review-again')}
              aria-pressed={status === 'review-again'}
            >
              <ArrowClockwise aria-hidden="true" /> Review again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
