/**
 * Content Statistics Page
 *
 * Visualizes curriculum metrics (word count, reading time, exercises).
 *
 * Key Responsibilities:
 * - Aggregate stats from all lessons and exercises.
 * - Visualize distribution by phase using Recharts.
 * - Display key totals (Total Lessons, Total Exercises, Total Reading Time).
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAllLessons, getAllPhases, phaseIcons } from '../utils/contentLoader'
import { getReadingTime } from '../utils/contentLoader'
import SEOHead from '../components/SEOHead'
import AnimatedCounter from '../components/AnimatedCounter'

/**
 * Content statistics page component.
 *
 * Displays analytical insights about the curriculum including:
 * - Hero statistics (total lessons, phases, words, reading time)
 * - Difficulty distribution bar chart
 * - Phase breakdown with word counts and reading times
 * - Tag cloud visualization of most common tags
 * - Top concepts list showing frequently covered topics
 *
 * All statistics are computed dynamically from lesson content.
 *
 * @returns The rendered content statistics page
 */
export default function ContentStats() {
  const stats = useMemo(() => {
    const lessons = getAllLessons()
    const phases = getAllPhases()

    const getWordCount = (markdown: string) => {
      const plainText = markdown.replace(/```[\s\S]*?```/g, '').replace(/[#*_>`()!-]/g, '')
      return plainText.split(/\s+/).filter(Boolean).length
    }

    const lessonMetrics = lessons.map((l) => ({
      phase: l.phase,
      difficulty: (l.difficulty as string) || 'unknown',
      tags: ((l.tags as string[]) || []).map((t) => t.trim()).filter(Boolean),
      concepts: ((l.concepts as string[]) || []).map((c) => c.trim()).filter(Boolean),
      wordCount: getWordCount(l.content),
      readingTime: getReadingTime(l.content),
    }))

    // Total word count
    const totalWords = lessonMetrics.reduce((sum, l) => sum + l.wordCount, 0)
    const totalReadingMins = lessonMetrics.reduce((sum, l) => sum + l.readingTime, 0)

    // Difficulty breakdown
    const difficultyMap: Record<string, number> = {}
    for (const l of lessonMetrics) {
      difficultyMap[l.difficulty] = (difficultyMap[l.difficulty] || 0) + 1
    }

    // Tag cloud
    const tagMap: Record<string, number> = {}
    for (const l of lessonMetrics) {
      for (const t of l.tags) {
        tagMap[t] = (tagMap[t] || 0) + 1
      }
    }
    const tagCloud = Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)

    // Phase stats
    const phaseStats = phases.map((p) => {
      const phaseLessons = lessonMetrics.filter((l) => l.phase === p.phase)
      return {
        phase: p.phase,
        title: p.title,
        lessonCount: phaseLessons.length,
        totalWords: phaseLessons.reduce((sum, l) => sum + l.wordCount, 0),
        totalReadingTime: phaseLessons.reduce((sum, l) => sum + l.readingTime, 0),
      }
    })

    // Concept stats
    const conceptMap: Record<string, number> = {}
    for (const l of lessonMetrics) {
      for (const c of l.concepts) {
        conceptMap[c] = (conceptMap[c] || 0) + 1
      }
    }
    const topConcepts = Object.entries(conceptMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)

    return {
      lessonCount: lessons.length,
      phaseCount: phases.length,
      totalWords,
      totalReadingMins,
      difficultyMap,
      tagCloud,
      phaseStats,
      topConcepts,
    }
  }, [])

  const maxTagCount = stats.tagCloud[0]?.[1] || 1

  return (
    <div className="content-stats-page">
      <SEOHead
        title="Content Statistics"
        description="Comprehensive content analytics for the 108-day Coding for MBA curriculum — word counts, reading times, difficulty distributions, tag clouds, and phase breakdowns."
        path="/stats"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Content Stats', url: '/stats' },
        ]}
      />
      <h1>📊 Content Statistics</h1>
      <p className="stats-subtitle">
        An overview of the entire curriculum's content, structure, and coverage.
      </p>

      {/* Hero stats */}
      <div className="stats-hero-grid">
        <div className="stats-hero-card">
          <span className="stats-hero-value">
            <AnimatedCounter value={stats.lessonCount} />
          </span>
          <span className="stats-hero-label">Lessons</span>
        </div>
        <div className="stats-hero-card">
          <span className="stats-hero-value">
            <AnimatedCounter value={stats.phaseCount} />
          </span>
          <span className="stats-hero-label">Phases</span>
        </div>
        <div className="stats-hero-card">
          <span className="stats-hero-value">
            <AnimatedCounter value={stats.totalWords} format={(value) => value.toLocaleString()} />
          </span>
          <span className="stats-hero-label">Words</span>
        </div>
        <div className="stats-hero-card">
          <span className="stats-hero-value">
            <AnimatedCounter value={Math.round(stats.totalReadingMins / 60)} suffix="h" />
          </span>
          <span className="stats-hero-label">Reading Time</span>
        </div>
      </div>

      {/* Difficulty breakdown */}
      <section className="stats-section">
        <h2>Difficulty Distribution</h2>
        <div className="stats-bar-chart">
          {Object.entries(stats.difficultyMap).map(([diff, count]) => {
            const pct = (count / stats.lessonCount) * 100
            return (
              <div className="stats-bar-row" key={diff}>
                <span className="stats-bar-label">{diff}</span>
                <div className="stats-bar-track">
                  <div
                    className={`stats-bar-fill stats-bar-${diff}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="stats-bar-value">{count}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Phase breakdown */}
      <section className="stats-section">
        <h2>Phase Breakdown</h2>
        <div className="stats-phase-grid">
          {stats.phaseStats.map((p) => (
            <Link to={`/phase/${p.phase}`} className="stats-phase-card" key={p.phase}>
              <div className="stats-phase-header">
                <span className="stats-phase-icon">{phaseIcons[p.phase - 1]}</span>
                <span className="stats-phase-num">Phase {p.phase}</span>
              </div>
              <div className="stats-phase-title">{p.title}</div>
              <div className="stats-phase-meta">
                <span>{p.lessonCount} lessons</span>
                <span>{p.totalWords.toLocaleString()} words</span>
                <span>~{p.totalReadingTime} min</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tag cloud */}
      <section className="stats-section">
        <h2>Tag Cloud</h2>
        <div className="stats-tag-cloud">
          {stats.tagCloud.map(([tag, count]) => {
            const scale = 0.7 + (count / maxTagCount) * 0.8
            return (
              <span
                className="stats-tag"
                key={tag}
                style={{ fontSize: `${scale}rem`, opacity: 0.5 + (count / maxTagCount) * 0.5 }}
              >
                {tag}
                <span className="stats-tag-count">{count}</span>
              </span>
            )
          })}
        </div>
      </section>

      {/* Top concepts */}
      <section className="stats-section">
        <h2>Top Concepts</h2>
        <div className="stats-concepts-grid">
          {stats.topConcepts.map(([concept, count]) => (
            <div className="stats-concept-pill" key={concept}>
              <span>{concept}</span>
              <span className="stats-concept-count">{count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
