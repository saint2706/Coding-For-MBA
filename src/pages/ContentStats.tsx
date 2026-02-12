import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAllLessons, getAllPhases, phaseIcons } from '../utils/contentLoader'
import { getReadingTime } from '../utils/contentLoader'
import { Helmet } from '@dr.pogodin/react-helmet'

export default function ContentStats() {
    const stats = useMemo(() => {
        const lessons = getAllLessons()
        const phases = getAllPhases()

        // Total word count
        let totalWords = 0
        for (const l of lessons) {
            const text = l.content.replace(/```[\s\S]*?```/g, '').replace(/[#*_>`()!-]/g, '')
            totalWords += text.split(/\s+/).filter(Boolean).length
        }

        // Difficulty breakdown
        const difficultyMap: Record<string, number> = {}
        for (const l of lessons) {
            const d = (l.difficulty as string) || 'unknown'
            difficultyMap[d] = (difficultyMap[d] || 0) + 1
        }

        // Tag cloud
        const tagMap: Record<string, number> = {}
        for (const l of lessons) {
            for (const t of (l.tags as string[]) || []) {
                tagMap[t] = (tagMap[t] || 0) + 1
            }
        }
        const tagCloud = Object.entries(tagMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 40)

        // Phase stats
        const phaseStats = phases.map((p) => {
            const phaseLessons = lessons.filter((l) => l.phase === p.phase)
            const words = phaseLessons.reduce((sum, l) => {
                const text = l.content.replace(/```[\s\S]*?```/g, '').replace(/[#*_>`()!-]/g, '')
                return sum + text.split(/\s+/).filter(Boolean).length
            }, 0)
            return {
                phase: p.phase,
                title: p.title,
                lessonCount: phaseLessons.length,
                totalWords: words,
                totalReadingTime: phaseLessons.reduce((s, l) => s + getReadingTime(l.content), 0),
            }
        })

        // Concept stats
        const conceptMap: Record<string, number> = {}
        for (const l of lessons) {
            for (const c of (l.concepts as string[]) || []) {
                conceptMap[c] = (conceptMap[c] || 0) + 1
            }
        }
        const topConcepts = Object.entries(conceptMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)

        const totalReadingMins = lessons.reduce((s, l) => s + getReadingTime(l.content), 0)

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
            <Helmet title="Content Stats" />
            <h1>📊 Content Statistics</h1>
            <p className="stats-subtitle">
                An overview of the entire curriculum's content, structure, and coverage.
            </p>

            {/* Hero stats */}
            <div className="stats-hero-grid">
                <div className="stats-hero-card">
                    <span className="stats-hero-value">{stats.lessonCount}</span>
                    <span className="stats-hero-label">Lessons</span>
                </div>
                <div className="stats-hero-card">
                    <span className="stats-hero-value">{stats.phaseCount}</span>
                    <span className="stats-hero-label">Phases</span>
                </div>
                <div className="stats-hero-card">
                    <span className="stats-hero-value">{stats.totalWords.toLocaleString()}</span>
                    <span className="stats-hero-label">Words</span>
                </div>
                <div className="stats-hero-card">
                    <span className="stats-hero-value">{Math.round(stats.totalReadingMins / 60)}h</span>
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
