import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import {
    getAllExercises,
    getAllNotebooks,
    difficultyConfig,
    phaseIcons,
} from '../utils/contentLoader'
import Breadcrumb from '../components/Breadcrumb'

export default function Exercises() {
    const exercises = getAllExercises()
    const notebooks = getAllNotebooks()
    const [phaseFilter, setPhaseFilter] = useState<number | ''>('')
    const [difficultyFilter, setDifficultyFilter] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

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
        return exercises.filter((ex) => {
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
    }, [exercises, phaseFilter, difficultyFilter, searchQuery])

    // Group by phase for notebook links
    const notebookPhases = new Set(notebooks.map((n) => n.phase))

    return (
        <div className="page-container">
            <Helmet>
                <title>Exercises — Coding for MBA</title>
                <meta
                    name="description"
                    content="Browse and filter all exercises across the 108-day curriculum. Practice Python, SQL, and data science."
                />
            </Helmet>
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
                            <Link
                                key={p}
                                to={`/solutions/${p}`}
                                className="exercises-notebook-link"
                            >
                                <span>{icon}</span> Phase {p} Solutions
                            </Link>
                        ) : null
                    })}
                </div>
            </div>

            {/* Filters */}
            <div className="exercises-filters">
                <div className="exercises-filter-group">
                    <label htmlFor="phase-filter">Phase</label>
                    <select
                        id="phase-filter"
                        value={phaseFilter}
                        onChange={(e) =>
                            setPhaseFilter(e.target.value === '' ? '' : Number(e.target.value))
                        }
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
            <div className="exercises-grid">
                {filtered.map((ex, idx) => {
                    const diff = difficultyConfig[ex.difficulty] || difficultyConfig.beginner!
                    const icon = phaseIcons[ex.phase - 1] || '📖'
                    return (
                        <div className="exercise-card" key={`${ex.day}-${idx}`}>
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
                        </div>
                    )
                })}
            </div>

            {filtered.length === 0 && (
                <div className="exercises-empty">
                    <p>No exercises match your filters. Try adjusting your search.</p>
                </div>
            )}
        </div>
    )
}
