/**
 * Concept Graph Page
 *
 * Displays a visual network graph of connected curriculum concepts.
 *
 * Key Responsibilities:
 * - Aggregate concepts from all lessons.
 * - Render the interactive D3 graph (`ConceptGraph`).
 * - Provide context and navigation instructions.
 */

import { useState, useCallback } from 'react'
import SEOHead from '../components/SEOHead'
import ConceptGraph from '../components/ConceptGraph'
import Breadcrumb from '../components/Breadcrumb'
import { useDebounce } from '../hooks/useDebounce'

/**
 * Phase colors used in the concept graph visualization.
 * Each phase is assigned a distinct color for easy visual identification.
 */
const PHASE_COLORS = [
  '#4cc9f0',
  '#4895ef',
  '#4361ee',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#3b82f6',
  '#ec4899',
  '#f97316',
]

/**
 * Phase names for the legend.
 * Short names used in the phase filter legend.
 */
const PHASE_NAMES = [
  'Python Foundations',
  'Functions & Modularity',
  'Data Engineering',
  'Math & ML',
  'Advanced ML',
  'Cutting Edge ML',
  'BI Analytics',
  'SQL Mastery',
  'Enterprise SQL',
]

/**
 * Concept graph page component.
 *
 * Displays an interactive force-directed graph where:
 * - Each node represents a lesson (colored by phase)
 * - Edges show prerequisite dependencies
 * - Users can click nodes to navigate to lessons
 * - Search filters lessons by title or concepts
 * - Phase buttons highlight specific phases
 *
 * @returns The rendered concept graph page
 */
export default function ConceptGraphPage() {
  const [search, setSearch] = useState('')
  // Debounce search term to prevent excessive D3 updates on every keystroke
  const shouldResetImmediately = useCallback((s: string) => s === '', [])
  const debouncedSearch = useDebounce(search, 300, shouldResetImmediately)
  const [activePhase, setActivePhase] = useState<number | null>(null)

  /**
   * Toggles the active phase filter.
   *
   * Clicking an active phase deselects it, clicking an inactive phase
   * selects it and highlights related nodes in the graph.
   *
   * @param phase - Phase number to toggle (1-9)
   */
  const handlePhaseClick = useCallback((phase: number) => {
    setActivePhase((prev) => (prev === phase ? null : phase))
  }, [])

  return (
    <div className="concept-graph-page">
      <SEOHead
        title="Concept Dependency Graph"
        description="Interactive visualization of lesson dependencies and concept relationships across the 140-day curriculum."
        path="/concepts"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Concept Graph', url: '/concepts' },
        ]}
      />

      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Concept Graph' }]} />

      <div className="concept-graph-header">
        <h1>🔗 Concept Dependency Graph</h1>
        <p>
          Explore how lessons connect through prerequisites. Each node is a lesson, colored by
          phase. Edges show prerequisite relationships. Click any node to navigate to that lesson.
        </p>
      </div>

      <div className="concept-graph-controls">
        <input
          type="text"
          className="concept-graph-search"
          placeholder="Search lessons or concepts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search concept graph"
        />
        <div className="concept-graph-legend">
          {PHASE_NAMES.map((name, i) => (
            <button
              type="button"
              key={i}
              className="legend-item focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
              onClick={() => handlePhaseClick(i + 1)}
              style={activePhase === i + 1 ? { background: 'rgba(255,255,255,0.1)' } : undefined}
              aria-pressed={activePhase === i + 1}
              title={`Phase ${i + 1}: ${name}`}
              aria-label={`Filter by Phase ${i + 1}: ${name}`}
            >
              <span className="legend-dot" style={{ background: PHASE_COLORS[i] }} />P{i + 1}
            </button>
          ))}
        </div>
      </div>

      <ConceptGraph search={debouncedSearch} highlightPhase={activePhase} />
    </div>
  )
}
