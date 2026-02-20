/**
 * Exercises List Page
 *
 * A centralized dashboard of all coding exercises available in the curriculum.
 *
 * Key Responsibilities:
 * - List all exercises sorted by day.
 * - Show completion status for each exercise.
 * - Provide a total progress summary.
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import SEOHead from '../components/SEOHead'
import {
  getAllExercises,
  getAllNotebooks,
  difficultyConfig,
  phaseIcons,
} from '../utils/contentLoader'
import Breadcrumb from '../components/Breadcrumb'
import { useQuizStore } from '../stores/quizStore'

/**
 * Exercise browser page component.
 *
 * Features include:
 * - Filterable grid of all curriculum exercises
 * - Phase filter dropdown (all phases or specific phase)
 * - Difficulty filter dropdown (all levels or specific level)
 * - Keyword search across title, goal, lesson title, and tags
 * - Links to phase solution notebooks
 * - Exercise count display
 * - Empty state when no exercises match filters
 *
 * @returns The rendered exercises page
 */

function ExercisesEmptyIllustration({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <svg
      className="empty-state-illustration"
      viewBox="0 0 220 130"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="exerciseEmptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(99,102,241,0.85)" />
          <stop offset="100%" stopColor="rgba(14,165,233,0.75)" />
        </linearGradient>
      </defs>
      <rect x="30" y="20" width="162" height="88" rx="12" fill="rgba(148,163,184,0.1)" />
      <path
        d="M56 49h110"
        stroke="url(#exerciseEmptyGradient)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M56 68h72"
        stroke="url(#exerciseEmptyGradient)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M56 87h92"
        stroke="url(#exerciseEmptyGradient)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle
        cx="164"
        cy="78"
        r="11"
        fill="none"
        stroke="url(#exerciseEmptyGradient)"
        strokeWidth="4"
      />
      <path
        d="M160 78l4 4 8-9"
        fill="none"
        stroke="url(#exerciseEmptyGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="44"
        cy="34"
        r="4"
        fill="rgba(14,165,233,0.75)"
        className={reducedMotion ? '' : 'empty-state-dot'}
      />
    </svg>
  )
}

export default function Exercises() {
  const exercises = getAllExercises()
  const notebooks = getAllNotebooks()
  const [phaseFilter, setPhaseFilter] = useState<number | ''>('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'phase-asc' | 'phase-desc' | 'title-asc'>('phase-asc')
  const prefersReducedMotion = !!useReducedMotion()

  const lowScoringTopics = useQuizStore((state) => state.getLowScoringTopics(60, 2).slice(0, 5))

  // Derive available phases from exercises
  const phases = useMemo(() => {
    const set = new Set(exercises.map((e) => e.phase))
    return Array.from(set).sort((a, b) => a - b)
  }, [exercises])

  // Derive available difficulties
  const difficulties = useMemo(() => {
    const set = new Set(exercises.map((e) => e.difficulty))
    return Array.from(set)
  }, [exercises])

  // Filter logic
  const filtered = useMemo(() => {
    const results = exercises.filter((ex) => {
      if (phaseFilter !== '' && ex.phase !== phaseFilter) return false
      if (difficultyFilter && ex.difficulty !== difficultyFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          ex.title.toLowerCase().includes(q) ||
          ex.goal.toLowerCase().includes(q) ||
          ex.lessonTitle.toLowerCase().includes(q) ||
          ex.tags.some((t) => t.toLowerCase().includes(q))
        )
      }
      return true
    })

    return results.sort((a, b) => {
      if (sortOrder === 'phase-desc') return b.phase - a.phase || b.day - a.day
      if (sortOrder === 'title-asc') return a.title.localeCompare(b.title)
      return a.phase - b.phase || a.day - b.day
    })
  }, [exercises, phaseFilter, difficultyFilter, searchQuery, sortOrder])

  // Group by phase for notebook links
  const notebookPhases = new Set(notebooks.map((n) => n.phase))

  return (
    <div className="page-container">
      <SEOHead
        title="Exercises"
        description="Browse and filter all exercises across the 108-day curriculum. Practice Python, SQL, and data science with hands-on coding exercises."
        path="/exercises"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Exercises', url: '/exercises' },
        ]}
      />
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Exercises' }]} />

      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <h2>🧪 Exercise Browser</h2>
        <p>
          {exercises.length} exercises across {phases.length} phases — filter by topic, difficulty,
          or search.
        </p>
      </div>

      {/* Solution Notebooks Banner */}
      <div className="exercises-notebooks">
        <h3 className="exercises-notebooks__title">📓 Phase Solution Notebooks</h3>
        <div className="exercises-notebooks__grid">
          {phases.map((p) => {
            const icon = phaseIcons[p - 1] || '📖'
            const hasNotebook = notebookPhases.has(p)
            return hasNotebook ? (
              <Link key={p} to={`/solutions/${p}`} className="exercises-notebook-link">
                <span>{icon}</span> Phase {p} Solutions
              </Link>
            ) : null
          })}
        </div>
      </div>

      {lowScoringTopics.length > 0 && (
        <div className="exercises-low-scoring">
          <h3>📉 Spaced Repetition Focus</h3>
          <p>Revisit these lower-scoring quiz topics to improve retention:</p>
          <ul>
            {lowScoringTopics.map((topic) => (
              <li key={topic.quizId}>
                {topic.topic} — accuracy {topic.accuracy}% ({topic.incorrect} misses)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="exercises-filters">
        <div className="exercises-filter-group">
          <label htmlFor="phase-filter">Phase</label>
          <select
            id="phase-filter"
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">All Phases</option>
            {phases.map((p) => (
              <option key={p} value={p}>
                Phase {p}
              </option>
            ))}
          </select>
        </div>

        <div className="exercises-filter-group">
          <label htmlFor="difficulty-filter">Difficulty</label>
          <select
            id="difficulty-filter"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">All Levels</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {(difficultyConfig[d] || difficultyConfig.beginner!).label}
              </option>
            ))}
          </select>
        </div>

        <div className="exercises-filter-group">
          <label htmlFor="sort-order">Sort</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as 'phase-asc' | 'phase-desc' | 'title-asc')
            }
          >
            <option value="phase-asc">Phase (Ascending)</option>
            <option value="phase-desc">Phase (Descending)</option>
            <option value="title-asc">Title (A→Z)</option>
          </select>
        </div>

        <div className="exercises-filter-group exercises-filter-search">
          <label htmlFor="exercise-search">Search</label>
          <input
            id="exercise-search"
            type="text"
            placeholder="Search exercises…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results count */}
      <p className="exercises-count">
        Showing {filtered.length} of {exercises.length} exercises
      </p>

      {/* Exercise Grid */}
      <motion.div className="exercises-grid" layout>
        {filtered.map((ex, idx) => {
          const diff = difficultyConfig[ex.difficulty] || difficultyConfig.beginner!
          const icon = phaseIcons[ex.phase - 1] || '📖'
          return (
            <motion.div
              className="exercise-card"
              key={`${ex.day}-${idx}`}
              layout
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            >
              <div className="exercise-card__header">
                <span className="exercise-card__phase">
                  {icon} Phase {ex.phase}
                </span>
                <span
                  className="difficulty-badge"
                  style={{ color: diff.color, background: diff.bg }}
                >
                  {diff.label}
                </span>
              </div>
              <h4 className="exercise-card__title">{ex.title}</h4>
              {ex.goal && <p className="exercise-card__goal">{ex.goal}</p>}
              <div className="exercise-card__footer">
                <Link to={`/lesson/${ex.day}`} className="exercise-card__link">
                  Day {ex.day}: {ex.lessonTitle} →
                </Link>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="exercises-empty glass-card">
          <ExercisesEmptyIllustration reducedMotion={prefersReducedMotion} />
          <p>No exercises match your filters. Try adjusting your search.</p>
        </div>
      )}
    </div>
  )
}
