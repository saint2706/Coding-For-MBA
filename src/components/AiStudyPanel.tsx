/**
 * AI Study Panel
 *
 * Floating chat panel on the lesson page for AI-powered study assistance.
 * Features: lesson Q&A, flashcard generation, and quick action prompts.
 *
 * @module components/AiStudyPanel
 */

import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAiAssistantStore } from '../stores/aiAssistantStore'
import {
  askAboutLesson,
  checkGeminiAvailability,
  generateFlashcards,
  isGeminiAvailable,
  type ChatMessage,
} from '../utils/geminiClient'
import type { DayToken } from '../utils/dayToken'

interface AiStudyPanelProps {
  lessonContent: string
  lessonDay: DayToken
  lessonTitle: string
}

const QUICK_ACTIONS = [
  { label: '📝 Summarise', prompt: 'Summarise this lesson in 5 key bullet points.' },
  {
    label: '🧒 ELI5',
    prompt: "Explain this lesson like I'm 5 years old.",
  },
  {
    label: '💼 MBA angle',
    prompt: 'How does this lesson apply to real MBA business scenarios? Give 3 examples.',
  },
  {
    label: '❓ Quiz me',
    prompt: "Ask me 3 quiz questions based on this lesson (don't show answers yet).",
  },
]

export default function AiStudyPanel({ lessonContent, lessonDay, lessonTitle }: AiStudyPanelProps) {
  const {
    isOpen,
    isLoading,
    activeTab,
    messagesByDay,
    flashcardsByDay,
    toggle,
    close,
    setLoading,
    setActiveTab,
    addMessage,
    clearMessages,
    setFlashcards,
  } = useAiAssistantStore()

  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isAiAvailable, setIsAiAvailable] = useState(() => isGeminiAvailable())
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const dayKey = String(lessonDay)
  const messages = messagesByDay[dayKey] || []
  const flashcards = flashcardsByDay[dayKey] || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoading])

  useEffect(() => {
    let isMounted = true

    checkGeminiAvailability()
      .then((available) => {
        if (isMounted) {
          setIsAiAvailable(available)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAiAvailable(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let focusTimeoutId: ReturnType<typeof setTimeout> | undefined

    if (isOpen && activeTab === 'chat') {
      focusTimeoutId = setTimeout(() => inputRef.current?.focus(), 200)
    }

    return () => {
      if (focusTimeoutId) {
        clearTimeout(focusTimeoutId)
      }
    }
  }, [isOpen, activeTab])

  const handleSubmit = useCallback(
    async (questionOverride?: string) => {
      const question = questionOverride || input.trim()
      if (!question || isLoading) return

      setInput('')
      setError(null)

      const userMsg: ChatMessage = { role: 'user', text: question }
      addMessage(dayKey, userMsg)
      setLoading(true)

      try {
        const history = messages.slice(-8)
        const reply = await askAboutLesson(lessonContent, question, history)
        addMessage(dayKey, { role: 'model', text: reply })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [input, isLoading, dayKey, messages, lessonContent, addMessage, setLoading],
  )

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  const handleGenerateFlashcards = useCallback(async () => {
    if (isLoading) return
    setLoading(true)
    setError(null)
    setFlippedCards(new Set())

    try {
      const cards = await generateFlashcards(lessonContent)
      setFlashcards(dayKey, cards)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate flashcards'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [isLoading, lessonContent, dayKey, setFlashcards, setLoading])

  const toggleFlashcard = (cardId: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) {
        next.delete(cardId)
      } else {
        next.add(cardId)
      }
      return next
    })
  }

  const handleFlashcardKeyDown = (e: KeyboardEvent<HTMLDivElement>, cardId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleFlashcard(cardId)
    }
  }

  if (!isAiAvailable) return null

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            className="ai-fab"
            onClick={toggle}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            aria-label="Open AI Study Assistant"
          >
            <span className="ai-fab-icon">✨</span>
            Ask AI
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="ai-panel-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.div
              className="ai-panel"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            >
              {/* Header */}
              <div className="ai-panel-header">
                <h3>
                  <span>✨</span> AI Study Assistant
                </h3>
                <button type="button" className="ai-panel-close" onClick={close} aria-label="Close">
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="ai-panel-tabs">
                <button
                  type="button"
                  className={`ai-panel-tab ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  💬 Chat
                </button>
                <button
                  type="button"
                  className={`ai-panel-tab ${activeTab === 'flashcards' ? 'active' : ''}`}
                  onClick={() => setActiveTab('flashcards')}
                >
                  🃏 Flashcards
                </button>
              </div>

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <>
                  {messages.length === 0 && (
                    <div className="ai-quick-actions">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          className="ai-quick-action"
                          onClick={() => handleSubmit(action.prompt)}
                          disabled={isLoading}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="ai-messages">
                    {messages.length === 0 && !isLoading && (
                      <div className="ai-empty-state">
                        <span className="ai-empty-icon">🤖</span>
                        <p>
                          Ask anything about <strong>{lessonTitle}</strong>
                        </p>
                      </div>
                    )}

                    {messages.map((msg) => {
                      const messageId = msg.id || `${msg.role}-${msg.text}`

                      return (
                        <div key={messageId} className={`ai-message ${msg.role}`}>
                          {msg.text}
                        </div>
                      )
                    })}

                    {isLoading && (
                      <div className="ai-typing">
                        <span className="ai-typing-dot" />
                        <span className="ai-typing-dot" />
                        <span className="ai-typing-dot" />
                      </div>
                    )}

                    {error && <div className="ai-error">⚠ {error}</div>}

                    <div ref={messagesEndRef} />
                  </div>

                  <form className="ai-input-area" onSubmit={handleFormSubmit}>
                    <input
                      ref={inputRef}
                      type="text"
                      className="ai-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about this lesson..."
                      disabled={isLoading}
                      aria-label="Ask a question"
                    />
                    <button
                      type="submit"
                      className="ai-send-btn"
                      disabled={!input.trim() || isLoading}
                    >
                      Send
                    </button>
                  </form>

                  {messages.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '0.3rem' }}>
                      <button
                        type="button"
                        onClick={() => clearMessages(dayKey)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        Clear chat history
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Flashcards Tab */}
              {activeTab === 'flashcards' && (
                <div className="ai-flashcards">
                  {flashcards.length === 0 ? (
                    <div className="ai-empty-state">
                      <span className="ai-empty-icon">🃏</span>
                      <p>Generate flashcards from this lesson to test your knowledge.</p>
                      <button
                        type="button"
                        className="ai-quick-action ai-flashcard-generate"
                        onClick={handleGenerateFlashcards}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Generating...' : '✨ Generate Flashcards'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="ai-flashcard-hint">
                        Click or press Enter/Space to reveal the answer
                      </p>
                      {flashcards.map((card) => {
                        const cardId = card.id || `${card.front}-${card.back}`

                        const isFlipped = flippedCards.has(cardId)

                        return (
                          <div
                            key={cardId}
                            role="button"
                            tabIndex={0}
                            aria-expanded={isFlipped}
                            className={`ai-flashcard ${!isFlipped ? 'collapsed' : ''}`}
                            onClick={() => toggleFlashcard(cardId)}
                            onKeyDown={(e) => handleFlashcardKeyDown(e, cardId)}
                          >
                            <div className="ai-flashcard-front">{card.front}</div>
                            <div className="ai-flashcard-back">{card.back}</div>
                          </div>
                        )
                      })}
                      <button
                        type="button"
                        className="ai-quick-action ai-flashcard-generate"
                        onClick={handleGenerateFlashcards}
                        disabled={isLoading}
                        style={{ alignSelf: 'center', marginTop: '0.5rem' }}
                      >
                        {isLoading ? 'Generating...' : '🔄 Regenerate'}
                      </button>
                    </>
                  )}

                  {error && <div className="ai-error">⚠ {error}</div>}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
