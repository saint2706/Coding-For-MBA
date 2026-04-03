/**
 * Exercise Card Component
 *
 * Renders a single exercise item in the exercises list.
 * Memoized to prevent re-rendering when list filters change but the item itself remains the same.
 */

import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { difficultyConfig, phaseIcons, type Exercise } from '../utils/contentLoader'

interface ExerciseCardProps {
  exercise: Exercise
}

function ExerciseCard({ exercise }: ExerciseCardProps) {
  const diff = difficultyConfig[exercise.difficulty] || difficultyConfig.beginner!
  const icon = phaseIcons[exercise.phase - 1] || '📖'
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="exercise-card"
      layout
      transition={
        prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 24 }
      }
    >
      <div className="exercise-card__header">
        <span className="exercise-card__phase">
          <span aria-hidden="true">{icon}</span> Phase {exercise.phase}
        </span>
        <span className="difficulty-badge" style={{ color: diff.color, background: diff.bg }}>
          {diff.label}
        </span>
      </div>
      <h3 className="exercise-card__title">{exercise.title}</h3>
      {exercise.goal && <p className="exercise-card__goal">{exercise.goal}</p>}
      <div className="exercise-card__footer">
        <Link to={`/lesson/${exercise.day}`} className="exercise-card__link">
          Day {exercise.day}: {exercise.lessonTitle} →
        </Link>
      </div>
    </motion.div>
  )
}

/**
 * Renders a single exercise item in the exercises list.
 * Memoized to prevent re-rendering when list filters change but the item itself remains the same.
 *
 * @param {ExerciseCardProps} props - The component props.
 * @param {Exercise} props.exercise - The exercise data to render.
 * @returns {JSX.Element} The exercise card component.
 */
export default memo(ExerciseCard)
