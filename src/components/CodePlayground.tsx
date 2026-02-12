import { useState, useCallback, useRef, useEffect } from 'react'
import PythonRunner from './PythonRunner'

interface CodePlaygroundProps {
    initialCode: string
    expectedOutput?: string
}

export default function CodePlayground({ initialCode, expectedOutput }: CodePlaygroundProps) {
    const [code, setCode] = useState(initialCode)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleReset = useCallback(() => {
        setCode(initialCode)
    }, [initialCode])

    // Auto-resize textarea
    useEffect(() => {
        const ta = textareaRef.current
        if (ta) {
            ta.style.height = 'auto'
            ta.style.height = ta.scrollHeight + 'px'
        }
    }, [code])

    return (
        <div className="code-playground">
            <div className="code-playground__toolbar">
                <span className="code-playground__label">🐍 Python Playground</span>
                <div className="code-playground__actions">
                    <button
                        className="code-playground__btn code-playground__btn--reset"
                        onClick={handleReset}
                        aria-label="Reset code to original"
                    >
                        ↺ Reset
                    </button>
                </div>
            </div>

            <div className="code-playground__editor-area">
                <textarea
                    ref={textareaRef}
                    className="code-playground__textarea"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    aria-label="Python code editor"
                />
            </div>

            <PythonRunner code={code} />

            {expectedOutput && (
                <div className="code-playground__expected">
                    <div className="code-playground__expected-header">Expected Output</div>
                    <pre className="code-playground__expected-body">{expectedOutput}</pre>
                </div>
            )}
        </div>
    )
}
