import { z } from 'zod'

const difficultyInfoSchema = z.object({
  label: z.string().min(1),
  color: z.string().min(1),
  bg: z.string().min(1),
})

const difficultyConfigSchema = z.record(z.string().min(1), difficultyInfoSchema)
const phaseIconsSchema = z.array(z.string().min(1)).length(9)

export type DifficultyInfo = z.infer<typeof difficultyInfoSchema>
export type DifficultyConfig = z.infer<typeof difficultyConfigSchema>
export type PhaseIcons = z.infer<typeof phaseIconsSchema>

export const difficultyConfig: DifficultyConfig = difficultyConfigSchema.parse({
  beginner: { label: 'Beginner', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  intermediate: { label: 'Intermediate', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  advanced: { label: 'Advanced', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  expert: { label: 'Expert', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
})

export const phaseIcons: PhaseIcons = phaseIconsSchema.parse([
  '🐍',
  '🔧',
  '🌐',
  '📐',
  '🧠',
  '🚀',
  '📊',
  '🗄️',
  '⚡',
])
