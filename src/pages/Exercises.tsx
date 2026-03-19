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
import { motion } from 'motion/react'
import { ExercisesEmptyIllustration } from '../components/EmptyStateIllustrations'
import SEOHead from '../components/SEOHead'
import ExerciseCard from '../components/ExerciseCard'
import { buildCollectionPageSchema } from '../utils/seoSchemas'
import {
  getAllExercises,
  getAllNotebooks,
  difficultyConfig,
  phaseIcons,
} from '../utils/contentLoader'
import Breadcrumb from '../components/Breadcrumb'
import { compareDayTokens } from '../utils/dayToken'
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

export default function Exercises() {
  const exercises = getAllExercises()
  const notebooks = getAllNotebooks()
  const [phaseFilter, setPhaseFilter] = useState<number | ''>('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'phase-asc' | 'phase-desc' | 'title-asc'>('phase-asc')

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
      if (sortOrder === 'phase-desc') return b.phase - a.phase || compareDayTokens(b.day, a.day)
      if (sortOrder === 'title-asc') return a.title.localeCompare(b.title)
      return a.phase - b.phase || compareDayTokens(a.day, b.day)
    })
  }, [exercises, phaseFilter, difficultyFilter, searchQuery, sortOrder])

  // Group by phase for notebook links
  const notebookPhases = new Set(notebooks.map((n) => n.phase))

  const collectionSchema = buildCollectionPageSchema(
    'Exercises Browser',
    'Browse and filter all exercises across the 140-day curriculum. Practice Python, SQL, and data science with hands-on coding exercises.',
    '/exercises',
    exercises.slice(0, 10).map((ex) => ({
      name: ex.title,
      description: ex.goal,
      url: `/lesson/${ex.day}`,
    })),
  )

  return (
    <div className="page-container">
      <SEOHead
        title="Exercises"
        description="Browse and filter all exercises across the 140-day curriculum. Practice Python, SQL, and data science with hands-on coding exercises."
        path="/exercises"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Exercises', url: '/exercises' },
        ]}
        jsonLd={[collectionSchema]}
      />
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Exercises' }]} />

      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <h1>🧪 Exercise Browser</h1>
        <p>
          {exercises.length} exercises across {phases.length} phases — filter by topic, difficulty,
          or search.
        </p>
      </div>

      {/* Solution Notebooks Banner */}
      <div className="exercises-notebooks">
        <h2 className="exercises-notebooks__title">📓 Phase Solution Notebooks</h2>
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
          <h2>📉 Spaced Repetition Focus</h2>
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
        {filtered.map((ex, idx) => (
          <ExerciseCard key={`${ex.day}-${idx}`} exercise={ex} />
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="exercises-empty glass-card">
          <ExercisesEmptyIllustration />
          <p>No exercises match your filters. Try adjusting your search.</p>
        </div>
      )}
    </div>
  )
}
