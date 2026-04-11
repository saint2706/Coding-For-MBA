/**
 * Case Studies & Projects Page
 *
 * Surfaces all case studies and capstone projects for the curriculum.
 *
 * Key Responsibilities:
 * - List all case studies with metadata (difficulty, time estimate, phases).
 * - List all projects with metadata.
 * - Allow filtering by difficulty.
 * - Provide expandable markdown content for each entry.
 */

import { useState } from 'react'
import { motion } from 'motion/react'
import SEOHead from '../components/SEOHead'
import Breadcrumb from '../components/Breadcrumb'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { getAllCaseStudies, getAllProjects, difficultyConfig } from '../utils/contentLoader'
import { buildCollectionPageSchema } from '../utils/seoSchemas'

type Tab = 'case-studies' | 'projects'

function normalizeDifficulty(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('advanced')) return 'advanced'
  if (lower.includes('intermediate')) return 'intermediate'
  return 'beginner'
}

/**
 * Case Studies & Projects browser page.
 *
 * Shows all case studies and capstone projects available in the curriculum,
 * organized into tabs with difficulty filtering and expandable content.
 *
 * @returns The rendered case studies & projects page
 */
export default function CaseStudies() {
  const caseStudies = getAllCaseStudies()
  const projects = getAllProjects()
  const [activeTab, setActiveTab] = useState<Tab>('case-studies')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

  const items = activeTab === 'case-studies' ? caseStudies : projects

  const filtered = difficultyFilter
    ? items.filter((item) => normalizeDifficulty(item.difficulty) === difficultyFilter)
    : items

  const toggleExpand = (slug: string) => {
    setExpandedSlug((prev) => (prev === slug ? null : slug))
  }

  const collectionSchema = buildCollectionPageSchema(
    'Case Studies & Projects',
    'Explore real-world case studies and capstone projects covering ML, data science, BI, and SQL — designed to build your MBA portfolio.',
    '/case-studies',
    [...caseStudies, ...projects].slice(0, 20).map((item) => ({
      name: item.title,
      description: item.phasesCovered || item.difficulty,
      url: `/case-studies`,
    })),
  )

  return (
    <div className="page-container">
      <SEOHead
        title="Case Studies & Projects"
        description="Explore real-world case studies and capstone projects covering ML, data science, BI, and SQL — designed to build your MBA portfolio."
        path="/case-studies"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Case Studies & Projects', url: '/case-studies' },
        ]}
        jsonLd={[collectionSchema]}
      />
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Case Studies & Projects' }]} />

      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <h1>
          <span aria-hidden="true">📂</span> Case Studies &amp; Projects
        </h1>
        <p>
          {caseStudies.length} case studies · {projects.length} capstone projects — apply your
          skills to real-world business problems.
        </p>
      </div>

      {/* Tabs */}
      <div className="cs-tabs" role="tablist" aria-label="Content type">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'case-studies'}
          className={`cs-tab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${activeTab === 'case-studies' ? 'cs-tab--active' : ''}`}
          onClick={() => {
            setActiveTab('case-studies')
            setExpandedSlug(null)
          }}
        >
          <span aria-hidden="true">🏢</span> Case Studies ({caseStudies.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'projects'}
          className={`cs-tab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${activeTab === 'projects' ? 'cs-tab--active' : ''}`}
          onClick={() => {
            setActiveTab('projects')
            setExpandedSlug(null)
          }}
        >
          <span aria-hidden="true">🔨</span> Projects ({projects.length})
        </button>
      </div>

      {/* Difficulty filter */}
      <div className="exercises-filters" style={{ marginTop: '1rem' }}>
        <div className="exercises-filter-group">
          <label htmlFor="cs-difficulty-filter">Difficulty</label>
          <select
            id="cs-difficulty-filter"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <p className="exercises-count">
        Showing {filtered.length} of {items.length}{' '}
        {activeTab === 'case-studies' ? 'case studies' : 'projects'}
      </p>

      {/* Cards */}
      <motion.div className="cs-grid" layout>
        {filtered.map((item) => {
          const normDiff = normalizeDifficulty(item.difficulty)
          const diff = difficultyConfig[normDiff] ?? {
            label: 'Intermediate',
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.12)',
          }
          const isExpanded = expandedSlug === item.slug

          return (
            <motion.div
              key={item.slug}
              className="cs-card glass-card"
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="cs-card__header">
                <div className="cs-card__meta">
                  <span
                    className="difficulty-badge"
                    style={{ color: diff.color, background: diff.bg }}
                  >
                    {diff.label}
                  </span>
                  {item.estimatedTime && (
                    <span className="meta-pill">
                      <span aria-hidden="true">⏱</span> {item.estimatedTime}
                    </span>
                  )}
                </div>
                <h2 className="cs-card__title">{item.title}</h2>
                {item.phasesCovered && <p className="cs-card__phases">{item.phasesCovered}</p>}
              </div>

              <div className="cs-card__footer">
                <button
                  type="button"
                  className="cs-card__expand-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-expanded={isExpanded}
                  onClick={() => toggleExpand(item.slug)}
                >
                  {isExpanded ? '▲ Hide details' : '▼ View details'}
                </button>
              </div>

              {isExpanded && (
                <motion.div
                  className="cs-card__content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18 }}
                >
                  <MarkdownRenderer content={item.content} />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="exercises-empty glass-card">
          <p>No {activeTab === 'case-studies' ? 'case studies' : 'projects'} match your filters.</p>
        </div>
      )}
    </div>
  )
}
