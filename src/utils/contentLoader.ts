/**
 * Content Loading and Parsing Utilities
 *
 * Centralizes the loading, parsing, and normalization of static content files
 * (Markdown lessons, Jupyter notebooks, phases, etc.) via Vite's import.meta.glob.
 *
 * Key Responsibilities:
 * - Load and parse Frontmatter from lesson READMEs.
 * - Manage relationships between lessons (prerequisites, phases).
 * - Extract exercises, concepts, and review cards from content.
 * - Provide immutable, cached access to all content data.
 */

import { parseMarkdown } from './frontmatter'
import { difficultyConfig, phaseIcons } from './curriculumConfig'

/**
 * Represents a single lesson unit.
 * Contains metadata (Frontmatter) and the raw Markdown body.
 */
export interface Lesson {
  /** The day number of the lesson (unique ID). */
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

/** Phase metadata and overview markdown content. */
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

const lessonFiles = import.meta.glob('/content/lessons/**/README.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const phaseFiles = import.meta.glob('/content/lessons/**/Phase_Overview.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

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

/** Return all phases sorted by phase number. */
export function getAllPhases(): readonly ImmutablePhase[] {
  return immutablePhases
}

/** Return a phase by number. */
export function getPhase(phaseNum: string | number): ImmutablePhase | undefined {
  return immutablePhases.find((p) => p.phase === Number(phaseNum))
}

/** Return all lessons sorted by day number. */
export function getAllLessons(): readonly ImmutableLesson[] {
  return immutableLessons
}

/** Return a lesson by day number. */
export function getLesson(dayNum: string | number): ImmutableLesson | undefined {
  return immutableLessons.find((l) => l.day === Number(dayNum))
}

/** Return all lessons in a phase. */
export function getLessonsByPhase(phaseNum: string | number): readonly ImmutableLesson[] {
  return immutableLessons.filter((l) => l.phase === Number(phaseNum))
}

/** Return previous and next lessons around the given day. */
export function getAdjacentLessons(dayNum: string | number): {
  prev: ImmutableLesson | null
  next: ImmutableLesson | null
} {
  const day = Number(dayNum)
  const currentIndex = immutableLessons.findIndex((l) => l.day === day)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: currentIndex > 0 ? (immutableLessons[currentIndex - 1] ?? null) : null,
    next:
      currentIndex < immutableLessons.length - 1
        ? (immutableLessons[currentIndex + 1] ?? null)
        : null,
  }
}

/** Exercise parsed from lesson markdown. */
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

export interface ReviewCardSeed {
  id: string
  day: number
  phase: number
  lessonTitle: string
  sourceType: 'concept' | 'heading' | 'exercise'
  prompt: string
  answer: string
}

/** Parse exercise sections from a lesson markdown body. */
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

function normalizeIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}

function extractHeadingsFromLessonContent(content: string): string[] {
  const headingRegex = /^###?\s+(.+)$/gm
  const headings = new Set<string>()
  let match
  while ((match = headingRegex.exec(content)) !== null) {
    const headingText = match[1]
    if (!headingText) continue
    const cleaned = headingText.trim()
    if (!cleaned) continue
    // Skip exercise headings like "Exercise 1: Title" since exercises are handled separately
    if (/^Exercise\s+\d+/i.test(cleaned)) continue
    headings.add(cleaned)
  }
  return [...headings]
}

function buildReviewCardsFromLesson(lesson: Lesson): ReviewCardSeed[] {
  const cards: ReviewCardSeed[] = []
  const concepts = lesson.concepts || []
  const headings = extractHeadingsFromLessonContent(lesson.content)
  const exercises = extractExercisesFromLesson(lesson)
  const seenIds = new Set<string>()

  const createUniqueId = (baseId: string): string => {
    let uniqueId = baseId
    let counter = 1
    while (seenIds.has(uniqueId)) {
      // Append counter to disambiguate collisions
      uniqueId = `${baseId}-${counter}`
      counter += 1
    }
    seenIds.add(uniqueId)
    return uniqueId
  }

  concepts.forEach((concept) => {
    const baseId = `d${lesson.day}-concept-${normalizeIdPart(concept)}`
    cards.push({
      id: createUniqueId(baseId),
      day: lesson.day,
      phase: lesson.phase,
      lessonTitle: lesson.title,
      sourceType: 'concept',
      prompt: `Explain this concept from Day ${lesson.day}: ${concept}`,
      answer: `Concept from Day ${lesson.day} (${lesson.title}): ${concept}`,
    })
  })

  headings.forEach((heading) => {
    const baseId = `d${lesson.day}-heading-${normalizeIdPart(heading)}`
    cards.push({
      id: createUniqueId(baseId),
      day: lesson.day,
      phase: lesson.phase,
      lessonTitle: lesson.title,
      sourceType: 'heading',
      prompt: `What is the key idea in this section: ${heading}?`,
      answer: `Review section “${heading}” in Day ${lesson.day} (${lesson.title}).`,
    })
  })

  exercises.forEach((exercise, index) => {
    const baseId = `d${lesson.day}-exercise-${index + 1}-${normalizeIdPart(exercise.title)}`
    cards.push({
      id: createUniqueId(baseId),
      day: lesson.day,
      phase: lesson.phase,
      lessonTitle: lesson.title,
      sourceType: 'exercise',
      prompt: `How would you solve exercise: ${exercise.title}?`,
      answer: exercise.goal || `Practice solving: ${exercise.title}`,
    })
  })

  return cards
}

const immutableLessons = Object.freeze(lessons.map(freezeLesson))
const immutablePhases = Object.freeze(phases.map(freezePhase))

let immutableExercises: readonly ImmutableExercise[] | null = null
let immutableReviewCards: readonly ImmutableReviewCardSeed[] | null = null

/** Return all parsed exercises across lessons. */
export function getAllExercises(): readonly ImmutableExercise[] {
  if (!immutableExercises) {
    const allExercises = lessons.flatMap(extractExercisesFromLesson)
    immutableExercises = Object.freeze(allExercises.map(freezeExercise))
  }
  return immutableExercises
}

export function getAllReviewCardSeeds(): readonly ImmutableReviewCardSeed[] {
  if (!immutableReviewCards) {
    const cards = lessons.flatMap(buildReviewCardsFromLesson)
    immutableReviewCards = Object.freeze(cards.map(freezeReviewCardSeed))
  }
  return immutableReviewCards
}

/** Jupyter notebook cell shape used by imported phase notebooks. */
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

/** Parsed notebook metadata for a phase solution file. */
export interface Notebook {
  phase: number
  cells: readonly NotebookCell[]
}

type ImmutableLesson = Readonly<Lesson>
type ImmutablePhase = Readonly<Phase>
type ImmutableExercise = Readonly<Exercise>
type ImmutableReviewCardSeed = Readonly<ReviewCardSeed>
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

function freezeReviewCardSeed(card: ReviewCardSeed): ImmutableReviewCardSeed {
  return Object.freeze({ ...card })
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

const notebookFiles = import.meta.glob('/content/lessons/**/Phase_*_Solutions.ipynb', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Parse notebook files and map each one to a phase number. */
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

let immutableNotebooks: readonly ImmutableNotebook[] | null = null

/** Return all parsed notebooks sorted by phase number. */
export function getAllNotebooks(): readonly ImmutableNotebook[] {
  if (!immutableNotebooks) {
    const notebooks = parseNotebooks()
    immutableNotebooks = Object.freeze(notebooks.map(freezeNotebook))
  }
  return immutableNotebooks
}

/** Return a notebook by phase number. */
export function getNotebook(phaseNum: string | number): ImmutableNotebook | undefined {
  return getAllNotebooks().find((n) => n.phase === Number(phaseNum))
}

/** Estimate reading time in minutes after removing markdown syntax noise. */
export function getReadingTime(content: string): number {
  const stripped = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_~>|`-]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim()
  const words = stripped.split(/\s+/).filter((w) => w.length > 0).length
  return Math.max(1, Math.round(words / 200))
}

/** Resolve prerequisite day references into lesson objects. */
export function getPrerequisiteLessons(lesson: Readonly<Lesson>): readonly ImmutableLesson[] {
  const prereqs = lesson.prerequisites as readonly number[] | undefined
  if (!prereqs || !Array.isArray(prereqs) || prereqs.length === 0) return []
  return prereqs
    .map((day) => immutableLessons.find((l) => l.day === Number(day)))
    .filter((l): l is ImmutableLesson => l !== undefined)
}

/** Return top related lessons ranked by shared tags/concepts and phase proximity. */
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

      lTags.forEach((t) => {
        if (myTags.has(t)) score += 2
      })
      lConcepts.forEach((c) => {
        if (myConcepts.has(c)) score += 3
      })
      if (l.phase === lesson.phase) score += 1
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

export { difficultyConfig, phaseIcons }
