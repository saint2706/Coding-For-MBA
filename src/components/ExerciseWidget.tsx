import { useState } from 'react'
import CodePlayground from './CodePlayground'

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
                    >
                        {showSolution ? '🔽 Hide Solution' : '💡 Show Solution'}
                    </button>
                    {showSolution && (
                        <pre className="exercise-widget__solution-code">{solution}</pre>
                    )}
                </div>
            )}
        </div>
    )
}
