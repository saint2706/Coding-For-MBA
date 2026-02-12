import { useState, useId } from 'react'
import CodePlayground from './CodePlayground'

interface MasteryCheckProps {
  questionNumber: number
  title: string
  questionText: string
  codeSnippet?: string
  answer: string
}

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

  return (
    <div className={`mastery-check ${revealed ? 'mastery-check--revealed' : ''}`}>
      <div className="mastery-check__header">
        <span className="mastery-check__badge">Q{questionNumber}</span>
        <h4 className="mastery-check__title">{title}</h4>
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
        className={`mastery-check__check-btn ${revealed ? 'mastery-check__check-btn--revealed' : ''}`}
        onClick={() => setRevealed((r) => !r)}
        aria-expanded={revealed}
        {...(revealed && { 'aria-controls': answerId })}
      >
        {revealed ? '🔽 Hide Answer' : '✅ Check Answer'}
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
