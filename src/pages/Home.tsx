/**
 * Home Page
 *
 * The landing page for the application.
 *
 * Key Responsibilities:
 * - Introduce the curriculum value proposition.
 * - Display high-level progress stats (if user has started).
 * - Link to the "Resume Learning" or "Start Course" action.
 * - Highlight key features (Python, Data Science, SQL).
 */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import SEOHead from '../components/SEOHead'
import { buildWebSiteSchema, buildCourseSchema, buildProductSchema } from '../utils/seoSchemas'
import {
  getAllPhases,
  getTotalReadingTime,
  getLessonsByPhase,
  getLesson,
  difficultyConfig,
  phaseIcons,
  getCurriculumMetadata,
} from '../utils/contentLoader'
import { useProgressStore } from '../stores/progressStore'
import { dayTokenToProgressId } from '../utils/dayToken'
import ProgressBar from '../components/ProgressBar'
import AnimatedCounter from '../components/AnimatedCounter'
import { useGamificationStore } from '../stores/gamificationStore'

/**
 * Home page component displaying the curriculum landing page.
 *
 * Features include:
 * - Hero section with curriculum statistics ({stats.totalDays} days, {stats.totalPhases} phases, etc.)
 * - Continue learning card showing last visited lesson
 * - Interactive grid of all learning phases with progress tracking
 * - Quick navigation to start learning or continue progress
 *
 * @returns The rendered home page
 */
export default function Home() {
  const phases = getAllPhases()
  const stats = getCurriculumMetadata()
  const [totalHours, setTotalHours] = useState<number | null>(null)
  const lastVisitedDay = useProgressStore((state) => state.lastVisitedLesson)
  const lastVisitedLesson = lastVisitedDay ? (getLesson(lastVisitedDay) ?? null) : null
  const lastVisitedPhase = lastVisitedLesson
    ? phases.find((phase) => phase.phase === lastVisitedLesson.phase)
    : null
  const completedLessons = useProgressStore((state) => state.completedLessons)
  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons])

  // ⚡ Bolt: Extracted phases map into a top-level useMemo to prevent O(N) array filtering
  // inside the render cycle. This resolves a performance bottleneck while avoiding
  // React Rules of Hooks violations.
  const renderedPhases = useMemo(
    () =>
      phases.map((phase) => {
        const lessons = getLessonsByPhase(phase.phase)
        const diff = difficultyConfig[phase.difficulty || 'beginner'] || difficultyConfig.beginner!
        const icon = phaseIcons[phase.phase - 1] || '📖'
        const hours = Math.round((phase.totalDuration || 0) / 60)
        const completedInPhaseCount = lessons.filter((l) =>
          completedSet.has(dayTokenToProgressId(l.day)),
        ).length

        return (
          <Link to={`/phase/${phase.phase}`} className="phase-card glass-card" key={phase.phase}>
            <div className="phase-card-header">
              <div className="phase-card-icon">{icon}</div>
              <div className="phase-card-title">
                <div className="phase-num">Phase {phase.phase}</div>
                <h3>{phase.title}</h3>
              </div>
            </div>
            <div className="phase-card-meta">
              <span className="difficulty-badge" style={{ color: diff.color, background: diff.bg }}>
                {diff.label}
              </span>
              <span className="meta-pill">
                <span aria-hidden="true">📅</span> {lessons.length} Days
              </span>
              {hours > 0 && (
                <span className="meta-pill">
                  <span aria-hidden="true">⏱</span> {hours}h
                </span>
              )}
            </div>
            {completedInPhaseCount > 0 && (
              <div className="phase-card-progress">
                <ProgressBar completed={completedInPhaseCount} total={lessons.length} />
              </div>
            )}
          </Link>
        )
      }),
    [phases, completedSet],
  )

  const { lastVisitedPhasePct } = useMemo(() => {
    const lessons = lastVisitedPhase ? getLessonsByPhase(lastVisitedPhase.phase) : []
    const pct = lastVisitedPhase
      ? Math.round(
          (lessons.filter((lesson) => completedSet.has(dayTokenToProgressId(lesson.day))).length /
            Math.max(1, lessons.length)) *
            100,
        )
      : 0
    return { lastVisitedPhasePct: pct }
  }, [lastVisitedPhase, completedSet])
  const completedCount = completedLessons.length
  const streakDays = useProgressStore((state) => state.streakDays())
  const totalLessons = stats.totalDays
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, prefersReducedMotion ? 0 : -50])

  const dailyChallenge = useGamificationStore((state) => state.dailyChallenge)
  const refreshDailyChallenge = useGamificationStore((state) => state.refreshDailyChallenge)

  useEffect(() => {
    refreshDailyChallenge()
  }, [refreshDailyChallenge])

  useEffect(() => {
    const calculateTotalHours = () => {
      // ⚡ Bolt: Use O(1) cached value instead of O(N) recalculation via reduce with expensive regex parsing
      const totalReadingMins = getTotalReadingTime()
      setTotalHours(Math.round(totalReadingMins / 60))
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = (
        window as Window & {
          requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number
        }
      ).requestIdleCallback(calculateTotalHours, { timeout: 2000 })

      return () => {
        ;(window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(
          idleId,
        )
      }
    }

    const timeoutId = globalThis.setTimeout(calculateTotalHours, 0)
    return () => globalThis.clearTimeout(timeoutId)
  }, [])

  const challengeLesson = getLesson(dailyChallenge.day)

  return (
    <div className="page-container">
      <SEOHead
        title="Coding for MBA — 140-Day Technical Curriculum"
        description={`A structured ${stats.totalDays}-day curriculum covering Python, Data Science, Machine Learning, Business Intelligence, and Enterprise SQL — designed for MBA professionals.`}
        path="/"
        jsonLd={[
          buildWebSiteSchema(),
          buildCourseSchema(),
          buildProductSchema(
            'Coding for MBA',
            'A structured 140-day curriculum covering Python, Data Science, Machine Learning, Business Intelligence, and Enterprise SQL — designed for MBA professionals.',
          ),
        ]}
        breadcrumbs={[{ name: 'Home', url: '/' }]}
      />
      {/* Hero */}
      <motion.section className="hero glass-card hero-with-cards" style={{ y: heroY }}>
        <div className="hero-content-col">
          <div className="hero-badge">
            <span aria-hidden="true">📚</span> Self-Study Curriculum
          </div>
          <h1>
            Master <span className="gradient-text">Technical Skills</span>
            <br />
            for Your MBA Career
          </h1>
          <p>
            A structured {stats.totalDays}-day curriculum covering Python, Data Science, Machine
            Learning, Business Intelligence, and Enterprise SQL — designed for business
            professionals.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-value">
                <AnimatedCounter value={stats.totalDays} />
              </span>
              <span className="stat-label">Days</span>
            </div>
            <div className="hero-stat">
              <span className="stat-value">
                <AnimatedCounter value={stats.totalPhases} />
              </span>
              <span className="stat-label">Phases</span>
            </div>
            <div className="hero-stat">
              <span className="stat-value">
                <AnimatedCounter value={totalHours ?? 0} suffix="+" />
              </span>
              <span className="stat-label">Hours</span>
            </div>
            <div className="hero-stat">
              <span className="stat-value">
                <AnimatedCounter value={stats.totalLevels} />
              </span>
              <span className="stat-label">Levels</span>
            </div>
          </div>
          <div className="hero-cta">
            <Link to="/lesson/1">Start Learning →</Link>
          </div>
          {completedCount > 0 && (
            <div className="hero-continue">
              <Link to="/progress">
                📊 {completedCount}/{totalLessons} Complete
              </Link>
            </div>
          )}
        </div>

        <div className="hero-cards-col" aria-hidden="true">
          {lastVisitedLesson ? (
            <div className="hero-float-card">
              <div className="hero-float-card-header">
                <div className="hero-float-card-icon" aria-hidden="true">
                  📖
                </div>
                <div>
                  <p className="hero-float-card-eyebrow">
                    {lastVisitedPhase ? `Phase ${lastVisitedPhase.phase}` : 'Continue'}
                  </p>
                  <p className="hero-float-card-title">
                    {lastVisitedPhase ? lastVisitedPhase.title : lastVisitedLesson.title}
                  </p>
                </div>
                <span className="hero-float-card-badge">Active</span>
              </div>
              <div className="hero-float-card-progress-row">
                <span>Progress</span>
                <span style={{ color: 'var(--accent-primary)' }}>
                  {lastVisitedPhase ? `${lastVisitedPhasePct}%` : `Day ${lastVisitedLesson.day}`}
                </span>
              </div>
              <div className="hero-float-card-bar">
                <div
                  className="hero-float-card-bar-fill"
                  style={{
                    width: lastVisitedPhase ? `${lastVisitedPhasePct}%` : '0%',
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="hero-float-card">
              <div className="hero-float-card-header">
                <div className="hero-float-card-icon" aria-hidden="true">
                  💻
                </div>
                <div>
                  <p className="hero-float-card-eyebrow">Phase 1</p>
                  <p className="hero-float-card-title">Programming Foundations</p>
                </div>
                <span className="hero-float-card-badge">Start</span>
              </div>
              <div className="hero-float-card-progress-row">
                <span>Progress</span>
                <span style={{ color: 'var(--accent-primary)' }}>0%</span>
              </div>
              <div className="hero-float-card-bar">
                <div className="hero-float-card-bar-fill" style={{ width: '0%' }} />
              </div>
            </div>
          )}
          <div className="hero-float-card hero-float-card--behind">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem',
              }}
            >
              <span aria-hidden="true" style={{ fontSize: '1.25rem' }}>
                🔥
              </span>
              <p style={{ fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
                Daily Streak
              </p>
            </div>
            <p
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--text-heading)',
                lineHeight: 1,
              }}
            >
              {streakDays}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Days
            </p>
          </div>
        </div>

        {/* Inline continue banners below hero content (always visible) */}
        {lastVisitedLesson && (
          <article className="continue-banner glass-card" aria-label="Continue learning">
            <p className="continue-banner-title">Continue learning</p>
            <p className="continue-banner-subtitle">
              {lastVisitedLesson.title}
              {lastVisitedPhase
                ? ` • Phase ${lastVisitedPhase.phase}: ${lastVisitedPhase.title}`
                : ''}
            </p>
            <Link className="continue-banner-cta" to={`/lesson/${lastVisitedLesson.day}`}>
              Resume Day {lastVisitedLesson.day}
            </Link>
          </article>
        )}

        {challengeLesson && (
          <article className="continue-banner glass-card" aria-label="Daily challenge">
            <p className="continue-banner-title">Daily Challenge</p>
            <p className="continue-banner-subtitle">
              Day {challengeLesson.day}: {challengeLesson.title}
            </p>
            <Link className="continue-banner-cta" to={`/lesson/${challengeLesson.day}`}>
              Take today&apos;s challenge
            </Link>
          </article>
        )}
      </motion.section>

      {/* Stats Bar */}
      <div className="home-stats-bar">
        <div className="home-stats-bar-item">
          <p className="home-stats-bar-label">Total Duration</p>
          <p className="home-stats-bar-value">
            <AnimatedCounter value={stats.totalDays} />
            <span className="home-stats-bar-unit">Days</span>
          </p>
        </div>
        <div className="home-stats-bar-item">
          <p className="home-stats-bar-label">Curriculum</p>
          <p className="home-stats-bar-value">
            <AnimatedCounter value={stats.totalPhases} />
            <span className="home-stats-bar-unit">Phases</span>
          </p>
        </div>
        <div className="home-stats-bar-item">
          <p className="home-stats-bar-label">Hands-on</p>
          <p className="home-stats-bar-value">
            25+<span className="home-stats-bar-unit">Projects</span>
          </p>
        </div>
        <div className="home-stats-bar-item">
          <p className="home-stats-bar-label">Community</p>
          <p className="home-stats-bar-value">
            5k+<span className="home-stats-bar-unit">Peers</span>
          </p>
        </div>
      </div>

      {/* Phases Grid */}
      <section>
        <div className="section-header">
          <h2>The Learning Path</h2>
          <p>
            From Python basics to enterprise database architecture — a structured journey through{' '}
            {stats.totalPhases}
            phases.
          </p>
        </div>

        <div className="phases-grid">{renderedPhases}</div>
      </section>
    </div>
  )
}
