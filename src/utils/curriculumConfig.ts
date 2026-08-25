/**
 * Curriculum Configuration
 *
 * Defines visual and structural constants for the curriculum, such as difficulty levels,
 * phase icons, and associated metadata. Validated at runtime using Zod schemas.
 *
 * Key Responsibilities:
 * - Define supported difficulty levels (beginner, intermediate, etc.) and their UI colors.
 * - Map phase numbers to representative icons.
 * - Enforce schema validation on configuration objects.
 */

import { z } from 'zod'

const difficultyInfoSchema = z.object({
  label: z.string().min(1),
  color: z.string().min(1),
  bg: z.string().min(1),
})

const difficultyConfigSchema = z.record(z.string().min(1), difficultyInfoSchema)
const phaseIconsSchema = z.array(z.string().min(1)).length(12)

/**
 * Visual styling information mapped to a specific difficulty level.
 * Defines the label text, foreground color, and background color.
 */
export type DifficultyInfo = z.infer<typeof difficultyInfoSchema>

/**
 * Record mapping string keys to DifficultyInfo schemas, defining visual styles
 * for different difficulty levels.
 */
export type DifficultyConfig = z.infer<typeof difficultyConfigSchema>

/**
 * Ordered array of strings used as icons representing different curriculum phases.
 */
export type PhaseIcons = z.infer<typeof phaseIconsSchema>

/**
 * Configuration mapping for lesson difficulty levels, providing labels and associated UI styling colors.
 * Validated against `difficultyConfigSchema`.
 *
 * @type {DifficultyConfig}
 */
export const difficultyConfig: DifficultyConfig = difficultyConfigSchema.parse({
  beginner: { label: 'Beginner', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  intermediate: { label: 'Intermediate', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  advanced: { label: 'Advanced', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  expert: { label: 'Expert', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
})

/**
 * Ordered array of icon names (see `iconRegistry.tsx`) representing the 12
 * curriculum phases. Validated against `phaseIconsSchema`.
 *
 * @type {PhaseIcons}
 */
export const phaseIcons: PhaseIcons = phaseIconsSchema.parse([
  'Code', // 1: Algorithmic Thinking & Python Foundations
  'Function', // 2: Functions, Modularity & Data Wrangling
  'Globe', // 3: Data Engineering & Web Development
  'MathOperations', // 4: Mathematical Foundations & ML Fundamentals
  'Brain', // 5: Advanced ML & Deep Learning
  'Rocket', // 6: Cutting-Edge ML
  'ChartBar', // 7: BI Analytics, Governance & Modern Data Stack
  'Database', // 8: SQL Mastery & Database Architecture
  'Lightning', // 9: Enterprise SQL Performance Engineering
  'Sparkle', // 10: Generative AI & LLM Engineering
  'CloudArrowUp', // 11: Cloud Data Engineering
  'Package', // 12: Analytics Engineering & Data Products
])
