/**
 * AI Dashboard Page
 *
 * Hub for all AI-powered learning features in the Coding for MBA curriculum.
 * Surfaces the Gemini-powered study assistant, explains capabilities, and
 * provides direct entry points into AI-assisted lessons.
 */

import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import SEOHead from '../components/SEOHead'
import { getAllLessons, getLesson } from '../utils/contentLoader'
import { getLastVisited } from '../utils/progressTracker'
import { useAiAssistantStore } from '../stores/aiAssistantStore'
import { compareDayTokens } from '../utils/dayToken'

const AI_FEATURES = [
  {
    icon: '🤖',
    title: 'Lesson Q&A',
    description:
      'Ask any question about the current lesson and get instant, context-aware answers powered by Gemini.',
  },
  {
    icon: '📝',
    title: 'Smart Summaries',
    description:
      'Generate concise bullet-point summaries of complex lessons to reinforce key concepts.',
  },
  {
    icon: '🧩',
    title: 'Flashcard Generation',
    description:
      'Automatically create study flashcards from lesson content to accelerate retention.',
  },
  {
    icon: '💼',
    title: 'MBA Business Context',
    description:
      'Translate technical concepts into real-world MBA business scenarios and case studies.',
  },
  {
    icon: '🎯',
    title: 'Quiz Generation',
    description: 'Test your understanding with AI-generated questions tailored to each lesson.',
  },
  {
    icon: '🧒',
    title: 'Simplified Explanations',
    description:
      'Get complex topics explained in simple, accessible language for any knowledge level.',
  },
]

const QUICK_START_LESSONS = [1, 8, 15, 22]

export default function AiDashboard() {
  const prefersReducedMotion = useReducedMotion()
  const lastVisitedDay = getLastVisited()
  const lastLesson = lastVisitedDay ? (getLesson(lastVisitedDay) ?? null) : null

  const allLessons = getAllLessons()
  const quickLessons = QUICK_START_LESSONS.map((day) => getLesson(day)).filter(
    (l): l is NonNullable<ReturnType<typeof getLesson>> => l != null,
  )

  const messagesByDay = useAiAssistantStore((state) => state.messagesByDay)
  const flashcardsByDay = useAiAssistantStore((state) => state.flashcardsByDay)

  // Build per-lesson AI usage history (lessons with any messages or flashcards)
  const aiHistory = Object.keys({ ...messagesByDay, ...flashcardsByDay })
    .map((dayKey) => {
      const day = Number(dayKey)
      const lesson = getLesson(day)
      const msgCount = (messagesByDay[dayKey] || []).filter((m) => m.role === 'user').length
      const cardCount = (flashcardsByDay[dayKey] || []).length
      return lesson ? { lesson, msgCount, cardCount } : null
    })
    .filter(
      (entry): entry is NonNullable<typeof entry> =>
        entry !== null && (entry.msgCount > 0 || entry.cardCount > 0),
    )
    .sort((a, b) => compareDayTokens(b.lesson.day, a.lesson.day))
    .slice(0, 8)

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.07,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.3 } },
  }

  return (
    <div className="page-container">
      <SEOHead
        title="AI Study Assistant — Coding for MBA"
        description="Explore AI-powered learning features: Gemini Q&A, flashcard generation, smart summaries, and MBA business context for every lesson."
        path="/ai"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'AI Assistant', url: '/ai' },
        ]}
      />

      {/* Hero */}
      <section className="hero glass-card" style={{ textAlign: 'left', padding: '3rem 2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 1.25rem',
            background: 'rgba(8, 181, 212, 0.12)',
            border: '1px solid rgba(8, 181, 212, 0.2)',
            borderRadius: '100px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--accent-tertiary)',
            textTransform: 'uppercase' as const,
            letterSpacing: '1.5px',
            marginBottom: '1.5rem',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              animation: 'pulse 2s infinite',
            }}
          />
          Powered by Gemini AI
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--text-heading)',
            marginBottom: '1rem',
          }}
        >
          Your AI Study{' '}
          <span
            style={{
              background: 'var(--gradient-hero)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Assistant
          </span>
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            maxWidth: '52ch',
            lineHeight: 1.7,
            marginBottom: '2rem',
          }}
        >
          Accelerate your learning with Gemini-powered Q&amp;A, flashcards, and business context
          built into every lesson.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' as const }}>
          {lastLesson ? (
            <Link
              to={`/lesson/${lastLesson.day}`}
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--gradient-hero)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(8, 181, 212, 0.3)',
              }}
            >
              ▶ Continue with AI — {lastLesson.title}
            </Link>
          ) : (
            <Link
              to="/lesson/1"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--gradient-hero)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(8, 181, 212, 0.3)',
              }}
            >
              ▶ Start Learning with AI
            </Link>
          )}
          <Link
            to="/curriculum"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              textDecoration: 'none',
            }}
          >
            Browse Curriculum
          </Link>
        </div>
      </section>

      {/* AI Features Grid */}
      <section style={{ marginTop: '3rem' }}>
        <h2
          style={{
            fontSize: '1.625rem',
            fontWeight: 700,
            color: 'var(--text-heading)',
            marginBottom: '0.5rem',
          }}
        >
          What AI Can Do For You
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The AI Study Assistant is available inside every lesson via the floating panel.
        </p>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {AI_FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              style={{
                padding: '1.5rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feature.icon}</div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-heading)',
                  marginBottom: '0.5rem',
                }}
              >
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Quick Start Lessons */}
      <section style={{ marginTop: '3rem' }}>
        <h2
          style={{
            fontSize: '1.625rem',
            fontWeight: 700,
            color: 'var(--text-heading)',
            marginBottom: '0.5rem',
          }}
        >
          Start a Lesson with AI
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Open any lesson and tap the ✨ AI button to start your session.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {quickLessons.map((lesson) => (
            <Link
              key={lesson.day}
              to={`/lesson/${lesson.day}`}
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                gap: '0.5rem',
                padding: '1.25rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition:
                  'border-color var(--transition-fast), box-shadow var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'rgba(8, 181, 212, 0.4)'
                el.style.boxShadow = '0 0 20px rgba(8, 181, 212, 0.1)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'var(--border-card)'
                el.style.boxShadow = 'none'
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--accent-tertiary)',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em',
                }}
              >
                Day {lesson.day}
              </span>
              <span
                style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-heading)' }}
              >
                {lesson.title}
              </span>
              <span
                style={{
                  marginTop: 'auto',
                  paddingTop: '0.5rem',
                  fontSize: '0.8125rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 500,
                }}
              >
                Open with AI →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Usage History */}
      {aiHistory.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h2
            style={{
              fontSize: '1.625rem',
              fontWeight: 700,
              color: 'var(--text-heading)',
              marginBottom: '0.5rem',
            }}
          >
            Recent AI Sessions
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Lessons where you've used the AI Study Assistant.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '0.875rem',
            }}
          >
            {aiHistory.map(({ lesson, msgCount, cardCount }) => (
              <Link
                key={lesson.day}
                to={`/lesson/${lesson.day}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: '0.5rem',
                  padding: '1.125rem 1.25rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  transition: 'border-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(8,181,212,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-card)'
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--accent-tertiary)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.08em',
                  }}
                >
                  Day {lesson.day}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--text-heading)',
                    lineHeight: 1.4,
                  }}
                >
                  {lesson.title}
                </span>
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '0.5rem',
                    display: 'flex',
                    gap: '0.75rem',
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {msgCount > 0 && (
                    <span>
                      💬 {msgCount} {msgCount === 1 ? 'question' : 'questions'}
                    </span>
                  )}
                  {cardCount > 0 && (
                    <span>
                      🃏 {cardCount} {cardCount === 1 ? 'flashcard' : 'flashcards'}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      <section
        style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center' as const,
        }}
      >
        <div>
          <p
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--accent-tertiary)',
              letterSpacing: '-0.02em',
            }}
          >
            {allLessons.length}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            AI-Ready Lessons
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--accent-tertiary)',
              letterSpacing: '-0.02em',
            }}
          >
            6
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            AI Features per Lesson
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--accent-tertiary)',
              letterSpacing: '-0.02em',
            }}
          >
            ∞
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Questions You Can Ask
          </p>
        </div>
      </section>
    </div>
  )
}
