/**
 * Curriculum Overview Page
 *
 * Displays the full syllabus grouped by phase.
 *
 * Key Responsibilities:
 * - List all phases and their contained lessons.
 * - Show progress bars per phase.
 * - Provide quick navigation to any lesson.
 */

import { useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import SEOHead from '../components/SEOHead'
import { buildItemListSchema, buildProductSchema } from '../utils/seoSchemas'
import {
  getAllPhases,
  getLessonsByPhase,
  difficultyConfig,
  getCurriculumMetadata,
} from '../utils/contentLoader'
import { dayTokenToProgressId } from '../utils/dayToken'
import Breadcrumb from '../components/Breadcrumb'
import { useProgressStore } from '../stores/progressStore'

/**
 * Curriculum roadmap page component.
 *
 * Displays the complete curriculum as a timeline organized by phases, with
 * each phase showing its lessons in chronological order. Each lesson shows
 * completion status, and phases display overall progress bars.
 *
 * @returns The rendered curriculum roadmap page
 */
export default function Curriculum() {
  const phases = getAllPhases()
  const prefersReducedMotion = useReducedMotion()
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 80%', 'end 30%'],
  })
  const timelineScaleY = useTransform(scrollYProgress, [0, 1], [0.1, 1])

  const completedLessons = useProgressStore((state) => state.completedLessons)
  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons])

  const phasesData = useMemo(() => {
    return phases.map((phase) => {
      const lessons = getLessonsByPhase(phase.phase)
      let completedInPhaseCount = 0
      for (let i = 0; i < lessons.length; i++) {
        if (completedSet.has(dayTokenToProgressId(lessons[i]!.day))) {
          completedInPhaseCount++
        }
      }
      const isPhaseComplete = completedInPhaseCount === lessons.length && lessons.length > 0
      const isPhaseStarted = completedInPhaseCount > 0
      const diff = difficultyConfig[phase.difficulty || 'beginner'] || difficultyConfig.beginner!
      const phaseLabel = String(phase.phase).padStart(2, '0')
      const phasePct = Math.round((completedInPhaseCount / Math.max(1, lessons.length)) * 100)

      return {
        ...phase,
        lessons,
        completedInPhaseCount,
        isPhaseComplete,
        isPhaseStarted,
        diff,
        phaseLabel,
        phasePct,
      }
    })
  }, [phases, completedSet])

  const { totalDays: totalLessons } = getCurriculumMetadata()
  const completedCount = useProgressStore((state) => state.completedLessonsCount())
  const overallPct = useMemo(
    () => (totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0),
    [totalLessons, completedCount],
  )
  const completedPhasesCount = useMemo(() => {
    let count = 0
    for (let i = 0; i < phasesData.length; i++) {
      if (phasesData[i]!.isPhaseComplete) {
        count++
      }
    }
    return count
  }, [phasesData])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  }

  const phaseVariants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  const itemListSchema = buildItemListSchema(
    'Full Curriculum Roadmap',
    'Browse the complete 145-day curriculum roadmap across 12 phases — from Python foundations to enterprise SQL.',
    phasesData.map((phase) => ({
      name: `Phase ${phase.phase}: ${phase.title}`,
      url: `/phase/${phase.phase}`,
      position: phase.phase,
      description: `Phase ${phase.phase} covers ${phase.lessons.length} lessons on ${phase.title}.`,
    })),
  )

  return (
    <div className="page-container">
      <SEOHead
        title="Full Curriculum Roadmap"
        description="Browse the complete 145-day curriculum roadmap across 12 phases — from Python foundations to enterprise SQL."
        path="/curriculum"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Curriculum', url: '/curriculum' },
        ]}
        jsonLd={[
          itemListSchema,
          buildProductSchema(
            'Coding for MBA',
            'A structured 145-day curriculum covering Python, Data Science, Machine Learning, Business Intelligence, and Enterprise SQL — designed for MBA professionals.',
          ),
        ]}
      />
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Curriculum' }]} />
      <header className="section-masthead curriculum-cover">
        <p className="section-eyebrow">
          {phases.length} phases · {totalLessons} days
        </p>
        <h1 className="section-headline display-headline">Full curriculum</h1>
        <p className="section-lede">
          {totalLessons} days of structured learning across {phases.length} phases — from Python
          foundations to enterprise SQL. Linear by default; jump anywhere.
        </p>
      </header>

      <div className="curriculum-stats-row">
        <div className="curriculum-stat">
          <p className="curriculum-stat-label">Total days</p>
          <p className="curriculum-stat-value display-numeral">{totalLessons}</p>
          <div className="curriculum-stat-bar">
            <div className="curriculum-stat-bar-fill" style={{ width: `${overallPct}%` }} />
          </div>
          <p className="curriculum-stat-note">{overallPct}% complete</p>
        </div>
        <div className="curriculum-stat">
          <p className="curriculum-stat-label">Phases</p>
          <p className="curriculum-stat-value display-numeral">{phases.length}</p>
          <div className="curriculum-stat-bar">
            <div
              className="curriculum-stat-bar-fill"
              style={{
                width: `${phases.length > 0 ? Math.round((completedPhasesCount / phases.length) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="curriculum-stat-note">
            {completedPhasesCount} of {phases.length} complete
          </p>
        </div>
        <div className="curriculum-stat">
          <p className="curriculum-stat-label">Lessons done</p>
          <p className="curriculum-stat-value display-numeral">{completedCount}</p>
          <div className="curriculum-stat-bar">
            <div className="curriculum-stat-bar-fill" style={{ width: `${overallPct}%` }} />
          </div>
          <p className="curriculum-stat-note">{totalLessons - completedCount} remaining</p>
        </div>
      </div>

      <motion.div
        className="curriculum-timeline"
        ref={timelineRef}
        style={{ ['--timeline-scale' as string]: prefersReducedMotion ? 1 : timelineScaleY }}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {phasesData.map((phase) => (
          <motion.section
            className={`curriculum-phase ${phase.isPhaseComplete ? 'curriculum-phase--complete' : ''} ${phase.isPhaseStarted ? 'curriculum-phase--active' : ''}`}
            key={phase.phase}
            variants={phaseVariants}
            transition={{ duration: prefersReducedMotion ? 0 : 0.28 }}
          >
            <Link
              to={`/phase/${phase.phase}`}
              className="curriculum-phase-header"
              {...createRoutePrefetchHandlers(`/phase/${phase.phase}`)}
            >
              <span className="curriculum-phase-num display-numeral" aria-hidden="true">
                {phase.phaseLabel}
              </span>
              <div className="curriculum-phase-headline">
                <p className="phase-card-kicker">
                  <span className="kicker-dot" aria-hidden="true" />
                  Phase
                  {phase.isPhaseComplete && (
                    <span className="curriculum-phase-status curriculum-phase-status--done">
                      ✓ Done
                    </span>
                  )}
                  {!phase.isPhaseComplete && phase.isPhaseStarted && (
                    <span className="curriculum-phase-status curriculum-phase-status--active">
                      Active
                    </span>
                  )}
                </p>
                <h2 className="curriculum-phase-title">{phase.title}</h2>
                <dl className="curriculum-phase-meta">
                  <div>
                    <dt>Level</dt>
                    <dd
                      className="phase-spread-difficulty"
                      style={{ color: phase.diff.color, background: phase.diff.bg }}
                    >
                      {phase.diff.label}
                    </dd>
                  </div>
                  <div>
                    <dt>Days</dt>
                    <dd>{phase.lessons.length}</dd>
                  </div>
                  <div>
                    <dt>Done</dt>
                    <dd>
                      {phase.completedInPhaseCount}/{phase.lessons.length} · {phase.phasePct}%
                    </dd>
                  </div>
                </dl>
                <div className="curriculum-phase-bar" aria-hidden="true">
                  <div
                    className="curriculum-phase-bar-fill"
                    style={{ width: `${phase.phasePct}%` }}
                  />
                </div>
              </div>
            </Link>

            <ol className="curriculum-days">
              {phase.lessons.map((lesson, index) => {
                const isDone = completedSet.has(dayTokenToProgressId(lesson.day))
                return (
                  <li key={lesson.day}>
                    <Link
                      to={`/lesson/${lesson.day}`}
                      className={`curriculum-day-link ${isDone ? 'curriculum-day-link--done' : ''}`}
                      {...createRoutePrefetchHandlers(`/lesson/${lesson.day}`)}
                    >
                      <span className="curriculum-day-marker" aria-hidden="true">
                        {isDone ? '✓' : String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="curriculum-day-num">Day {lesson.day}</span>
                      <span className="curriculum-day-title">{lesson.title}</span>
                      {isDone && <span className="sr-only">Completed.</span>}
                    </Link>
                  </li>
                )
              })}
            </ol>
          </motion.section>
        ))}
      </motion.div>
    </div>
  )
}
