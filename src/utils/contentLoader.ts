/**
 * Content Loader Module
 *
 * Provides utilities for loading, parsing, and enriching lesson content from markdown files.
 * This module handles frontmatter extraction, lesson/phase data management, exercise parsing,
 * and content enrichment features like reading time estimation and related content discovery.
 */

import { parseMarkdown } from './frontmatter'

// --- Public types ---

/**
 * Represents a single lesson in the curriculum.
 * Contains lesson metadata from frontmatter and the rendered content.
 */
export interface Lesson {
  day: number
  title: string
  phase: number
  difficulty?: string
  duration?: number
  tags?: readonly string[]
  concepts?: readonly string[]
  content: string
  path: string
  [key: string]: unknown
}

/**
 * Represents a phase (group of lessons) in the curriculum.
 * Contains phase metadata and overview content.
 */
export interface Phase {
  phase: number
  title: string
  difficulty?: string
  totalDuration?: number
  days?: readonly number[]
  content: string
  path: string
  [key: string]: unknown
}

/**
 * Styling information for difficulty badges.
 */
export interface DifficultyInfo {
  label: string
  color: string
  bg: string
}

// Import all markdown files at build time
const lessonFiles = import.meta.glob('/Lessons/**/README.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const phaseFiles = import.meta.glob('/Lessons/**/Phase_Overview.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// Parse all lessons
const lessons: Lesson[] = Object.entries(lessonFiles)
  .map(([path, raw]) => {
    const { frontmatter, content } = parseMarkdown(raw)
    return {
      ...frontmatter,
      content,
      path,
    } as Lesson
  })
  .sort((a, b) => (a.day || 0) - (b.day || 0))

// Parse all phase overviews
const phases: Phase[] = Object.entries(phaseFiles)
  .map(([path, raw]) => {
    const { frontmatter, content } = parseMarkdown(raw)
    return {
      ...frontmatter,
      content,
      path,
    } as Phase
  })
  .sort((a, b) => (a.phase || 0) - (b.phase || 0))

/**
 * Retrieves all phases in the curriculum.
 *
 * @returns Array of all phase objects, sorted by phase number
 */
export function getAllPhases(): readonly ImmutablePhase[] {
  return immutablePhases
}

/**
 * Retrieves a specific phase by its number.
 *
 * @param phaseNum - Phase number (1-9)
 * @returns The phase object if found, otherwise undefined
 */
export function getPhase(phaseNum: string | number): ImmutablePhase | undefined {
  return immutablePhases.find((p) => p.phase === Number(phaseNum))
}

/**
 * Retrieves all lessons in the curriculum.
 *
 * @returns Array of all lesson objects, sorted by day number
 */
export function getAllLessons(): readonly ImmutableLesson[] {
  return immutableLessons
}

/**
 * Retrieves a specific lesson by its day number.
 *
 * @param dayNum - Day number (1-108)
 * @returns The lesson object if found, otherwise undefined
 */
export function getLesson(dayNum: string | number): ImmutableLesson | undefined {
  return immutableLessons.find((l) => l.day === Number(dayNum))
}

/**
 * Retrieves all lessons belonging to a specific phase.
 *
 * @param phaseNum - Phase number (1-9)
 * @returns Array of lessons in the specified phase
 */
export function getLessonsByPhase(phaseNum: string | number): readonly ImmutableLesson[] {
  return immutableLessons.filter((l) => l.phase === Number(phaseNum))
}

/**
 * Finds the previous and next lessons relative to a given day.
 *
 * @param dayNum - Current lesson day number
 * @returns Object containing prev and next lesson references (or null if at boundaries)
 */
export function getAdjacentLessons(dayNum: string | number): {
  prev: ImmutableLesson | null
  next: ImmutableLesson | null
} {
  const day = Number(dayNum)
  const currentIndex = immutableLessons.findIndex((l) => l.day === day)
  return {
    prev: currentIndex > 0 ? (immutableLessons[currentIndex - 1] ?? null) : null,
    next:
      currentIndex < immutableLessons.length - 1
        ? (immutableLessons[currentIndex + 1] ?? null)
        : null,
  }
}

// --- Exercise extraction ---

/**
 * Represents a coding exercise extracted from lesson content.
 */
export interface Exercise {
  day: number
  lessonTitle: string
  phase: number
  difficulty: string
  title: string
  goal: string
  starterCode: string
  tags: readonly string[]
}

/**
 * Extracts all exercises from a lesson's markdown content.
 *
 * Parses sections matching "### Exercise N: Title" pattern and extracts
 * the goal description and starter code blocks.
 *
 * @param lesson - The lesson object to extract exercises from
 * @returns Array of exercise objects found in the lesson
 */
function extractExercisesFromLesson(lesson: Lesson): Exercise[] {
  const exercises: Exercise[] = []
  const regex =
    /### Exercise \d+:\s*(.+?)\n([\s\S]*?)(?=\n### Exercise \d+:|\n## |\n---\s*\n## |$)/g
  let match
  while ((match = regex.exec(lesson.content)) !== null) {
    const titleText = match[1]
    if (!titleText) continue
    const title = titleText.trim()
    const body = match[2] || ''
    const goalMatch = body.match(/\*\*Goal\*\*:\s*(.+)/)
    const goalText = goalMatch?.[1]
    const goal = goalText ? goalText.trim() : ''
    const codeRegex = /```(?:python|py)\s*\n([\s\S]*?)```/g
    let codeMatch
    const codeBlocks: string[] = []
    while ((codeMatch = codeRegex.exec(body)) !== null) {
      const code = codeMatch[1]
      if (code) codeBlocks.push(code.trim())
    }
    exercises.push({
      day: lesson.day,
      lessonTitle: lesson.title,
      phase: lesson.phase,
      difficulty: lesson.difficulty || 'beginner',
      title,
      goal,
      starterCode: codeBlocks[0] || '',
      tags: lesson.tags || [],
    })
  }
  return exercises
}

const allExercises: Exercise[] = lessons.flatMap(extractExercisesFromLesson)
const immutableLessons = Object.freeze(lessons.map(freezeLesson))
const immutablePhases = Object.freeze(phases.map(freezePhase))
const immutableExercises = Object.freeze(allExercises.map(freezeExercise))

/**
 * Retrieves all exercises from all lessons.
 *
 * @returns Array of all exercises across the entire curriculum
 */
export function getAllExercises(): readonly ImmutableExercise[] {
  return immutableExercises
}

// --- Notebook loading ---

/**
 * Represents a single cell in a Jupyter notebook.
 */
export interface NotebookCell {
  cell_type: 'code' | 'markdown' | 'raw'
  source: readonly string[]
  outputs?: ReadonlyArray<{
    output_type: string
    text?: readonly string[]
    data?: Record<string, readonly string[]>
    ename?: string
    evalue?: string
    traceback?: readonly string[]
  }>
  execution_count?: number | null
}

/**
 * Represents a Jupyter notebook containing solution code for a phase.
 */
export interface Notebook {
  phase: number
  cells: readonly NotebookCell[]
}

type ImmutableLesson = Readonly<Lesson>
type ImmutablePhase = Readonly<Phase>
type ImmutableExercise = Readonly<Exercise>
type ImmutableNotebookCell = Readonly<NotebookCell>
type ImmutableNotebook = Readonly<Notebook>

function freezeStringArray(values?: readonly string[]): readonly string[] | undefined {
  return values ? Object.freeze([...values]) : undefined
}

function freezeNumberArray(values?: readonly number[]): readonly number[] | undefined {
  return values ? Object.freeze([...values]) : undefined
}

function freezeLesson(lesson: Lesson): ImmutableLesson {
  return Object.freeze({
    ...lesson,
    tags: freezeStringArray(lesson.tags),
    concepts: freezeStringArray(lesson.concepts),
    prerequisites: freezeNumberArray(lesson.prerequisites as readonly number[] | undefined),
  })
}

function freezePhase(phase: Phase): ImmutablePhase {
  return Object.freeze({
    ...phase,
    days: freezeNumberArray(phase.days),
  })
}

function freezeExercise(exercise: Exercise): ImmutableExercise {
  return Object.freeze({
    ...exercise,
    tags: Object.freeze([...exercise.tags]),
  })
}

function freezeNotebookCell(cell: NotebookCell): ImmutableNotebookCell {
  return Object.freeze({
    ...cell,
    source: Object.freeze([...cell.source]),
    outputs: cell.outputs
      ? Object.freeze(
          cell.outputs.map((output) =>
            Object.freeze({
              ...output,
              text: output.text ? Object.freeze([...output.text]) : undefined,
              data: output.data
                ? Object.freeze(
                    Object.fromEntries(
                      Object.entries(output.data).map(([key, values]) => [
                        key,
                        Object.freeze([...values]),
                      ]),
                    ),
                  )
                : undefined,
              traceback: output.traceback ? Object.freeze([...output.traceback]) : undefined,
            }),
          ),
        )
      : undefined,
  })
}

function freezeNotebook(notebook: Notebook): ImmutableNotebook {
  return Object.freeze({
    ...notebook,
    cells: Object.freeze(notebook.cells.map(freezeNotebookCell)),
  })
}

const notebookFiles = import.meta.glob('/Lessons/**/Phase_*_Solutions.ipynb', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * Parses all Jupyter notebook files from the Lessons directory.
 *
 * @returns Array of notebook objects with phase numbers and parsed cells
 */
function parseNotebooks(): Notebook[] {
  return Object.entries(notebookFiles)
    .map(([path, raw]) => {
      const phaseMatch = path.match(/Phase_(\d+)/)
      const phaseValue = phaseMatch?.[1]
      const phase = phaseValue ? parseInt(phaseValue, 10) : 0
      try {
        const nb = JSON.parse(raw) as { cells: NotebookCell[] }
        return { phase, cells: nb.cells || [] }
      } catch {
        return { phase, cells: [] }
      }
    })
    .sort((a, b) => a.phase - b.phase)
}

const notebooks = parseNotebooks()
const immutableNotebooks = Object.freeze(notebooks.map(freezeNotebook))

/**
 * Retrieves all Jupyter notebooks.
 *
 * @returns Array of all notebook objects, sorted by phase number
 */
export function getAllNotebooks(): readonly ImmutableNotebook[] {
  return immutableNotebooks
}

/**
 * Retrieves a specific notebook by phase number.
 *
 * @param phaseNum - Phase number (1-9)
 * @returns The notebook object if found, otherwise undefined
 */
export function getNotebook(phaseNum: string | number): ImmutableNotebook | undefined {
  return immutableNotebooks.find((n) => n.phase === Number(phaseNum))
}

// --- Content enrichment helpers ---

/**
 * Estimates reading time in minutes (word count ÷ 200 wpm).
 *
 * Strips code blocks, frontmatter, and markdown syntax before counting words.
 * Uses an average reading speed of 200 words per minute.
 *
 * @param content - Raw markdown content to analyze
 * @returns Estimated reading time in minutes (minimum 1 minute)
 */
export function getReadingTime(content: string): number {
  const stripped = content
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`[^`]+`/g, '') // remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // links → text
    .replace(/#{1,6}\s/g, '') // remove heading markers
    .replace(/[*_~>|`-]/g, '') // remove markdown formatting
    .replace(/<[^>]+>/g, '') // remove HTML tags
    .trim()
  const words = stripped.split(/\s+/).filter((w) => w.length > 0).length
  return Math.max(1, Math.round(words / 200))
}

/**
 * Looks up prerequisite Lesson objects from the lesson's prerequisites array.
 *
 * @param lesson - The lesson to get prerequisites for
 * @returns Array of prerequisite lesson objects
 */
export function getPrerequisiteLessons(lesson: Readonly<Lesson>): readonly ImmutableLesson[] {
  const prereqs = lesson.prerequisites as readonly number[] | undefined
  if (!prereqs || !Array.isArray(prereqs) || prereqs.length === 0) return []
  return prereqs
    .map((day) => immutableLessons.find((l) => l.day === Number(day)))
    .filter((l): l is ImmutableLesson => l !== undefined)
}

/**
 * Finds related lessons by scoring shared tags, concepts, and phase proximity.
 *
 * Uses a scoring algorithm that awards points for:
 * - Shared tags (2 points each)
 * - Shared concepts (3 points each)
 * - Same phase (1 point)
 * - Adjacent phase (0.5 points)
 *
 * @param lesson - The lesson to find related lessons for
 * @param count - Maximum number of related lessons to return (default: 4)
 * @returns Array of the top related lesson objects, excluding self and prerequisites
 */
export function getRelatedLessons(lesson: Readonly<Lesson>, count = 4): readonly ImmutableLesson[] {
  const prereqs = new Set((lesson.prerequisites as readonly number[]) || [])
  const myTags = new Set((lesson.tags as readonly string[]) || [])
  const myConcepts = new Set((lesson.concepts as readonly string[]) || [])

  const scored = lessons
    .filter((l) => l.day !== lesson.day && !prereqs.has(l.day))
    .map((l) => {
      let score = 0
      const lTags = (l.tags as readonly string[]) || []
      const lConcepts = (l.concepts as readonly string[]) || []

      // Shared tags (2 pts each)
      lTags.forEach((t) => {
        if (myTags.has(t)) score += 2
      })
      // Shared concepts (3 pts each)
      lConcepts.forEach((c) => {
        if (myConcepts.has(c)) score += 3
      })
      // Same phase bonus (1 pt)
      if (l.phase === lesson.phase) score += 1
      // Phase proximity bonus (0.5 pts for adjacent phases)
      if (Math.abs(l.phase - lesson.phase) === 1) score += 0.5

      return { lesson: l, score, sharedTags: lTags.filter((t) => myTags.has(t)) }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)

  return Object.freeze(
    scored.map((s) =>
      Object.freeze({
        ...s.lesson,
        _sharedTags: Object.freeze([...s.sharedTags]),
        tags: freezeStringArray(s.lesson.tags),
        concepts: freezeStringArray(s.lesson.concepts),
      }),
    ),
  )
}

/**
 * Configuration mapping difficulty levels to display information.
 * Includes label, color, and background color for UI rendering.
 */
export const difficultyConfig: Record<string, DifficultyInfo> = {
  beginner: { label: 'Beginner', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  intermediate: { label: 'Intermediate', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  advanced: { label: 'Advanced', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  expert: { label: 'Expert', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
}

/**
 * Emoji icons representing each phase of the curriculum.
 * Array indices correspond to phase numbers (0-8 for phases 1-9).
 */
export const phaseIcons: string[] = [
  '🐍', // Phase 1: Python Foundations
  '🔧', // Phase 2: Functions & Modularity
  '🌐', // Phase 3: Data Eng & Web Dev
  '📐', // Phase 4: Math & ML
  '🧠', // Phase 5: Advanced ML
  '🚀', // Phase 6: Cutting Edge ML
  '📊', // Phase 7: BI Analytics
  '🗄️', // Phase 8: SQL Mastery
  '⚡', // Phase 9: Enterprise SQL
]
