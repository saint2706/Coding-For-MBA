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
import { getCompletedLessons, isLessonComplete, getCompletedForPhase } from '../utils/progressTracker'
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
export default function Curriculum() {
  const phases = getAllPhases()
  const prefersReducedMotion = useReducedMotion()
  const completedLessons = getCompletedLessons()
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 80%', 'end 30%'],
  })
  const timelineScaleY = useTransform(scrollYProgress, [0, 1], [0.1, 1])

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
    phases.map((phase) => ({
      name: `Phase ${phase.phase}: ${phase.title}`,
      url: `/phase/${phase.phase}`,
      position: phase.phase,
      description: `Phase ${phase.phase} covers ${getLessonsByPhase(phase.phase).length} lessons on ${phase.title}.`,
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
      <div className="section-header" style={{ marginBottom: '2.5rem' }}>
        <h2>Full Curriculum Roadmap</h2>
        <p>
          108 days of structured learning across 9 phases — from Python foundations to enterprise
          SQL.
        </p>
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
        {useMemo(() => phases.map((phase) => {
          const lessons = getLessonsByPhase(phase.phase)
          const diff =
            difficultyConfig[phase.difficulty || 'beginner'] || difficultyConfig.beginner!
          const icon = phaseIcons[phase.phase - 1] || '📖'

          return (
            <motion.div
              className="curriculum-phase glass-card"
              key={phase.phase}
              variants={phaseVariants}
              transition={{ duration: prefersReducedMotion ? 0 : 0.28 }}
            >
              <Link to={`/phase/${phase.phase}`} className="curriculum-phase-header">
                <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                <h3>
                  Phase {phase.phase}: {phase.title}
                </h3>
                <span
                  className="difficulty-badge"
                  style={{ color: diff.color, background: diff.bg, marginLeft: 'auto' }}
                >
                  {diff.label}
                </span>
              </Link>

              <div style={{ marginBottom: '0.75rem', paddingRight: '1rem' }}>
                <ProgressBar
                  completed={getCompletedForPhase(lessons.map((l) => l.day)).length}
                  total={lessons.length}
                />
              </div>

              <div className="curriculum-days">
                {lessons.map((lesson) => (
                  <Link
                    to={`/lesson/${lesson.day}`}
                    className="curriculum-day-link"
                    key={lesson.day}
                  >
                    <span className="day-num">Day {lesson.day}</span>
                    <span>{lesson.title}</span>
                    {isLessonComplete(lesson.day) && (
                      <span className="day-link-check" aria-label="Completed">
                        ✓
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          )
        }), [phases, completedLessons.length])}
      </motion.div>
    </div>
  )
}
