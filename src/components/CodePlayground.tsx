import { useState, useCallback, useRef, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import PythonRunner from './PythonRunner'

interface CodePlaygroundProps {
    initialCode: string
    expectedOutput?: string
}

const highlighterStyle = {
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

export default function CodePlayground({ initialCode, expectedOutput }: CodePlaygroundProps) {
    const [code, setCode] = useState(initialCode)
    const [showPreview, setShowPreview] = useState(false)
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
                        className="code-playground__btn code-playground__btn--preview"
                        onClick={() => setShowPreview((p) => !p)}
                        aria-label={showPreview ? 'Show editor' : 'Show preview'}
                    >
                        {showPreview ? '✏️ Edit' : '👁 Preview'}
                    </button>
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
                {showPreview ? (
                    <div className="code-playground__preview">
                        <SyntaxHighlighter
                            style={highlighterStyle}
                            language="python"
                            PreTag="div"
                            customStyle={{
                                margin: 0,
                                padding: '1rem',
                                background: 'transparent',
                                fontSize: '0.8125rem',
                                lineHeight: '1.65',
                            }}
                            codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
                        >
                            {code}
                        </SyntaxHighlighter>
                    </div>
                ) : (
                    <textarea
                        ref={textareaRef}
                        className="code-playground__textarea"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        spellCheck={false}
                        aria-label="Python code editor"
                    />
                )}
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
