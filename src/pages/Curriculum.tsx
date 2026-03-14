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
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import SEOHead from '../components/SEOHead'
import { buildItemListSchema } from '../utils/seoSchemas'
import {
  getAllPhases,
  getLessonsByPhase,
  difficultyConfig,
  phaseIcons,
} from '../utils/contentLoader'
import { getCompletedCount } from '../utils/progressTracker'
import { dayTokenToProgressId } from '../utils/dayToken'
import Breadcrumb from '../components/Breadcrumb'
import ProgressBar from '../components/ProgressBar'

/**
 * Curriculum roadmap page component.
 *
 * Displays the complete curriculum as a timeline organized by phases, with
 * each phase showing its lessons in chronological order. Each lesson shows
 * completion status, and phases display overall progress bars.
 *
 * @returns The rendered curriculum roadmap page
 */

import { useProgressStore } from '../stores/progressStore'

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
      const completedInPhase = lessons.filter((l) => completedSet.has(dayTokenToProgressId(l.day)))
      const isPhaseComplete = completedInPhase.length === lessons.length && lessons.length > 0
      const isPhaseStarted = completedInPhase.length > 0
      const diff = difficultyConfig[phase.difficulty || 'beginner'] || difficultyConfig.beginner!
      const icon = phaseIcons[phase.phase - 1] || '📖'

      return {
        ...phase,
        lessons,
        completedInPhase,
        isPhaseComplete,
        isPhaseStarted,
        diff,
        icon,
      }
    })
  }, [phases, completedSet])

  const totalLessons = useMemo(
    () => phasesData.reduce((sum, p) => sum + p.lessons.length, 0),
    [phasesData],
  )
  const completedCount = getCompletedCount()
  const overallPct = useMemo(
    () => (totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0),
    [totalLessons, completedCount],
  )
  const completedPhasesCount = useMemo(
    () => phasesData.filter((p) => p.isPhaseComplete).length,
    [phasesData],
  )

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
    'Browse the complete 108-day curriculum roadmap across 9 phases — from Python foundations to enterprise SQL.',
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
        description="Browse the complete 108-day curriculum roadmap across 9 phases — from Python foundations to enterprise SQL."
        path="/curriculum"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Curriculum', url: '/curriculum' },
        ]}
        jsonLd={[itemListSchema]}
      />
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Curriculum' }]} />
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <h2>Full Curriculum Roadmap</h2>
        <p>
          {totalLessons} days of structured learning across {phases.length} phases — from Python
          foundations to enterprise SQL.
        </p>
      </div>

      {/* Curriculum stat cards */}
      <div className="curriculum-stats-row">
        <div className="curriculum-stat-card glass-card">
          <span className="curriculum-stat-icon" aria-hidden="true">📅</span>
          <div>
            <p className="curriculum-stat-value">{totalLessons}</p>
            <p className="curriculum-stat-label">Total Days</p>
          </div>
          <div className="curriculum-stat-bar">
            <div className="curriculum-stat-bar-fill" style={{ width: `${overallPct}%` }} />
          </div>
          <p className="curriculum-stat-note">{overallPct}% Completed</p>
        </div>
        <div className="curriculum-stat-card glass-card">
          <span className="curriculum-stat-icon" aria-hidden="true">📚</span>
          <div>
            <p className="curriculum-stat-value">{phases.length}</p>
            <p className="curriculum-stat-label">Phases</p>
          </div>
          <div className="curriculum-stat-bar">
            <div
              className="curriculum-stat-bar-fill curriculum-stat-bar-fill--blue"
              style={{
                width: `${phases.length > 0 ? Math.round((completedPhasesCount / phases.length) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="curriculum-stat-note">
            {completedPhasesCount} of {phases.length} complete
          </p>
        </div>
        <div className="curriculum-stat-card glass-card">
          <span className="curriculum-stat-icon" aria-hidden="true">⏱️</span>
          <div>
            <p className="curriculum-stat-value">{completedCount}</p>
            <p className="curriculum-stat-label">Lessons Done</p>
          </div>
          <div className="curriculum-stat-bar">
            <div
              className="curriculum-stat-bar-fill curriculum-stat-bar-fill--purple"
              style={{ width: `${overallPct}%` }}
            />
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
        {phasesData.map((phase) => {
          return (
            <motion.div
              className={`curriculum-phase glass-card ${phase.isPhaseComplete ? 'curriculum-phase--complete' : ''}`}
              key={phase.phase}
              variants={phaseVariants}
              transition={{ duration: prefersReducedMotion ? 0 : 0.28 }}
            >
              <Link to={`/phase/${phase.phase}`} className="curriculum-phase-header">
                <span style={{ fontSize: '1.25rem' }}>{phase.icon}</span>
                <h2>
                  Phase {phase.phase}: {phase.title}
                </h2>
                {phase.isPhaseComplete ? (
                  <span className="curriculum-phase-status curriculum-phase-status--done">
                    ✓ Done
                  </span>
                ) : phase.isPhaseStarted ? (
                  <span className="curriculum-phase-status curriculum-phase-status--active">
                    Active
                  </span>
                ) : null}
                <span
                  className="difficulty-badge"
                  style={{
                    color: phase.diff.color,
                    background: phase.diff.bg,
                    marginLeft: phase.isPhaseComplete || phase.isPhaseStarted ? '0' : 'auto',
                  }}
                >
                  {phase.diff.label}
                </span>
              </Link>

              <div style={{ marginBottom: '0.75rem', paddingRight: '1rem' }}>
                <ProgressBar
                  completed={phase.completedInPhase.length}
                  total={phase.lessons.length}
                />
              </div>

              <div className="curriculum-days">
                {phase.lessons.map((lesson) => (
                  <Link
                    to={`/lesson/${lesson.day}`}
                    className="curriculum-day-link"
                    key={lesson.day}
                  >
                    <span className="day-num">Day {lesson.day}</span>
                    <span>{lesson.title}</span>
                    {completedSet.has(dayTokenToProgressId(lesson.day)) && (
                      <span className="day-link-check" aria-label="Completed">
                        ✓
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
