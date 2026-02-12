import { useState, useId } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import CodePlayground from './CodePlayground'

const solutionTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...(oneDark['pre[class*="language-"]'] as object),
    background: 'transparent',
    margin: 0,
    padding: 0,
  },
  'code[class*="language-"]': {
    ...(oneDark['code[class*="language-"]'] as object),
    background: 'transparent',
  },
}

interface ExerciseWidgetProps {
  title: string
  goal?: string
  instructions?: string
  starterCode: string
  expectedOutput?: string
  solution?: string
}

export default function ExerciseWidget({
  title,
  goal,
  instructions,
  starterCode,
  expectedOutput,
  solution,
}: ExerciseWidgetProps) {
  const [showSolution, setShowSolution] = useState(false)
  const solutionId = useId()

  return (
    <div className="exercise-widget">
      <div className="exercise-widget__header">
        <span className="exercise-widget__icon" aria-hidden="true">
          🧪
        </span>
        <h4 className="exercise-widget__title">{title}</h4>
      </div>

      {goal && (
        <p className="exercise-widget__goal">
          <strong>Goal:</strong> {goal}
        </p>
      )}

      {instructions && (
        <div className="exercise-widget__instructions">
          {instructions.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <CodePlayground initialCode={starterCode} expectedOutput={expectedOutput} />

      {solution && (
        <div className="exercise-widget__solution">
          <button
            className="exercise-widget__solution-btn"
            onClick={() => setShowSolution((s) => !s)}
            aria-expanded={showSolution}
            aria-controls={solutionId}
          >
            {showSolution ? '🔽 Hide Solution' : '💡 Show Solution'}
          </button>
          <div
            id={solutionId}
            role="region"
            aria-label="Solution"
            className={`exercise-widget__solution-panel ${showSolution ? 'exercise-widget__solution-panel--open' : ''}`}
            hidden={!showSolution}
            aria-hidden={!showSolution}
            inert={!showSolution}
          >
            <SyntaxHighlighter
              style={solutionTheme}
              language="python"
              PreTag="div"
              customStyle={{
                margin: 0,
                padding: '0.75rem',
                background: 'var(--bg-code)',
                fontSize: '0.8125rem',
                lineHeight: '1.65',
                borderRadius: 'var(--radius-sm)',
              }}
              codeTagProps={{
                style: {
                  fontFamily: 'var(--font-mono)',
                },
              }}
            >
              {solution}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  )
}
