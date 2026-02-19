import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)

export const lessonFrontmatterSchema = z.object({
  day: z.coerce.number().int().positive(),
  title: nonEmptyString,
  phase: z.coerce.number().int().positive(),
  difficulty: nonEmptyString,
  duration: z.coerce.number().positive(),
  tags: z.array(nonEmptyString).optional(),
  concepts: z.array(nonEmptyString).optional(),
})

export const phaseOverviewFrontmatterSchema = z.object({
  phase: z.coerce.number().int().positive(),
  title: nonEmptyString,
  days: z.array(z.coerce.number().int().positive()).nonempty(),
  totalDuration: z.coerce.number().positive(),
  difficulty: nonEmptyString,
  tags: z.array(nonEmptyString).optional(),
  concepts: z.array(nonEmptyString).optional(),
})
