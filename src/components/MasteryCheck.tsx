/**
 * Mastery Check Component
 *
 * A self-assessment widget embedded in lessons to test understanding.
 *
 * Key Responsibilities:
 * - Display a question and optional code snippet.
 * - Offer a "Check Answer" button to reveal the explanation.
 * - Support interactive code execution via `CodePlayground` if applicable.
 */

import { useState, useId } from 'react'
import CodePlayground from './CodePlayground'
import { buildFAQSchema } from '../utils/seoSchemas'

interface MasteryCheckProps {
  questionNumber: number
  title: string
  questionText: string
  codeSnippet?: string
  answer: string
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
 * @returns {JSX.Element} The interactive mastery check widget.
 */
export default function MasteryCheck({
  questionNumber,
  title,
  questionText,
  codeSnippet,
  answer,
}: MasteryCheckProps) {
  const [revealed, setRevealed] = useState(false)
  const answerId = useId()

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
      </div>

      <div className="mastery-check__question">
        {questionText.split('\n').map((line, i) => (line.trim() ? <p key={i}>{line}</p> : null))}
      </div>

      {hasRunnableCode && (
        <div className="mastery-check__playground">
          <CodePlayground initialCode={codeSnippet} />
        </div>
      )}

      <button
        type="button"
        className={`mastery-check__check-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${revealed ? 'mastery-check__check-btn--revealed' : ''}`}
        onClick={() => setRevealed((r) => !r)}
        aria-expanded={revealed}
        aria-label={revealed ? 'Hide Answer' : 'Show Answer'}
        {...(revealed && { 'aria-controls': answerId })}
      >
        {revealed ? (
          <>
            <span aria-hidden="true">🔽</span> Hide Answer
          </>
        ) : (
          <>
            <span aria-hidden="true">✅</span> Check Answer
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
            {answer.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
