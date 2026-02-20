/**
 * Content Schemas (Zod)
 *
 * Defines runtime validation schemas for lesson frontmatter and phase metadata.
 * Ensures consistent data structure across all markdown content.
 *
 * Key Responsibilities:
 * - Validate lesson properties (day, title, tags, concepts).
 * - Validate phase overview structure.
 * - Define strict types for difficulties and prerequisites.
 */

import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const positiveInt = z.coerce.number().int().positive()
const positiveNumber = z.coerce.number().positive()

export const difficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert'])

export const lessonFrontmatterSchema = z.object({
  day: positiveInt,
  title: nonEmptyString,
  phase: positiveInt,
  difficulty: difficultyLevelSchema,
  duration: positiveNumber,
  tags: z.array(nonEmptyString).optional(),
  concepts: z.array(nonEmptyString).optional(),
})

export const phaseOverviewFrontmatterSchema = z.object({
  phase: positiveInt,
  title: nonEmptyString,
  days: z.array(positiveInt).nonempty(),
  totalDuration: positiveNumber,
  difficulty: difficultyLevelSchema,
  tags: z.array(nonEmptyString).optional(),
  concepts: z.array(nonEmptyString).optional(),
})

export const exerciseSchema = z.object({
  day: positiveInt,
  lessonTitle: nonEmptyString,
  phase: positiveInt,
  difficulty: difficultyLevelSchema,
  title: nonEmptyString,
  goal: z.string(),
  starterCode: z.string(),
  expectedOutput: z.string().optional(),
})
