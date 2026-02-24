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
import {

  compareDayTokens,
  dayTokenFromPath,
  dayTokenFromReference,
  normalizeDayToken,
  parseDayToken,
  type DayToken,
} from './dayToken'
import { extractExercises } from './exerciseExtractor'

/**
 * Represents a single lesson unit.
 * Contains metadata (Frontmatter) and the raw Markdown body.
 */
export interface Lesson {
  /** The day number of the lesson (unique ID). */
  day: DayToken
  daySortKey?: string
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
  days?: readonly DayToken[]
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
    const frontmatterDay =
      typeof frontmatter.day === 'string' || typeof frontmatter.day === 'number'
        ? normalizeDayToken(frontmatter.day)
        : null
    const pathDay = dayTokenFromPath(path)
    const day = pathDay || frontmatterDay || '0'
    const parsedDay = parseDayToken(day)
    const prerequisites = Array.isArray(frontmatter.prerequisites)
      ? frontmatter.prerequisites
          .map((entry) => dayTokenFromReference(entry))
          .filter((entry): entry is DayToken => Boolean(entry))
      : undefined

    return {
      ...frontmatter,
      day,
      daySortKey: parsedDay?.sortKey || day,
      prerequisites,
      content,
      path,
    } as unknown as Lesson
  })
  .sort((a, b) => compareDayTokens(a.day, b.day))

const phases: Phase[] = Object.entries(phaseFiles)
  .map(([path, raw]) => {
    const { frontmatter, content } = parseMarkdown(raw)
    const days = Array.isArray(frontmatter.days)
      ? frontmatter.days
          .map((entry) => dayTokenFromReference(entry))
          .filter((entry): entry is DayToken => Boolean(entry))
      : undefined
    return {
      ...frontmatter,
      days,
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
  const dayToken = normalizeDayToken(dayNum)
  return immutableLessonByDay.get(dayToken)
}

/** Return all lessons in a phase. */
export function getLessonsByPhase(phaseNum: string | number): readonly ImmutableLesson[] {
  if (!immutableLessonsByPhase) {
    const byPhase: Record<number, Lesson[]> = {}
    for (const lesson of immutableLessons) {
      const p = lesson.phase
      if (!byPhase[p]) byPhase[p] = []
      byPhase[p].push(lesson as Lesson)
    }

    const frozenByPhase: Record<number, readonly ImmutableLesson[]> = {}
    for (const [p, list] of Object.entries(byPhase)) {
      frozenByPhase[Number(p)] = Object.freeze(list)
    }
    immutableLessonsByPhase = frozenByPhase
  }
  return immutableLessonsByPhase[Number(phaseNum)] || []
}

/** Return previous and next lessons around the given day. */
export function getAdjacentLessons(dayNum: string | number): {
  prev: ImmutableLesson | null
  next: ImmutableLesson | null
} {
  const dayToken = normalizeDayToken(dayNum)
  const currentIndex = immutableLessons.findIndex((l) => l.day === dayToken)

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
  day: DayToken
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
  day: DayToken
  phase: number
  lessonTitle: string
  sourceType: 'concept' | 'heading' | 'exercise'
  prompt: string
  answer: string
}

/** Parse exercise sections from a lesson markdown body. */
function extractExercisesFromLesson(lesson: Lesson): Exercise[] {
  return extractExercises(lesson.content).map((ex) => ({
    day: lesson.day,
    phase: lesson.phase,
    difficulty: lesson.difficulty || 'beginner',
    lessonTitle: lesson.title,
    title: ex.title,
    goal: ex.goal,
    starterCode: ex.starterCode,
    tags: lesson.tags || [],
    expectedOutput: ex.expectedOutput,
  }))
}

function normalizeIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}

function getLessonIdPrefix(lesson: Lesson): string {
  const segments = lesson.path.split('/')
  const lessonDir = segments[segments.length - 2] || `day-${lesson.day}`
  return `p${lesson.phase}-d${lesson.day}-${normalizeIdPart(lessonDir)}`
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

  const lessonIdPrefix = getLessonIdPrefix(lesson)

  concepts.forEach((concept) => {
    const baseId = `${lessonIdPrefix}-concept-${normalizeIdPart(concept)}`
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
    const baseId = `${lessonIdPrefix}-heading-${normalizeIdPart(heading)}`
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
    const baseId = `${lessonIdPrefix}-exercise-${index + 1}-${normalizeIdPart(exercise.title)}`
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
const immutableLessonByDay: Map<DayToken, ImmutableLesson> = new Map(
  immutableLessons.map((lesson) => [lesson.day, lesson]),
)

let immutableLessonsByPhase: Record<number, readonly ImmutableLesson[]> | null = null
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

function freezeDayTokenArray(values?: readonly DayToken[]): readonly DayToken[] | undefined {
  return values ? Object.freeze([...values]) : undefined
}

function freezeLesson(lesson: Lesson): ImmutableLesson {
  return Object.freeze({
    ...lesson,
    tags: freezeStringArray(lesson.tags),
    concepts: freezeStringArray(lesson.concepts),
    prerequisites: freezeDayTokenArray(lesson.prerequisites as readonly DayToken[] | undefined),
  })
}

function freezePhase(phase: Phase): ImmutablePhase {
  return Object.freeze({
    ...phase,
    days: freezeDayTokenArray(phase.days),
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
  const prereqs = lesson.prerequisites as readonly unknown[] | undefined
  if (!prereqs || !Array.isArray(prereqs) || prereqs.length === 0) return []
  return prereqs
    .map((day) => dayTokenFromReference(day))
    .map((day) => (day ? immutableLessonByDay.get(day) : undefined))
    .filter((l): l is ImmutableLesson => l !== undefined)
}

/** Return top related lessons ranked by shared tags/concepts and phase proximity. */
export function getRelatedLessons(lesson: Readonly<Lesson>, count = 4): readonly ImmutableLesson[] {
  const prereqs = new Set(
    ((lesson.prerequisites as readonly unknown[]) || [])
      .map((entry) => dayTokenFromReference(entry))
      .filter((entry): entry is DayToken => Boolean(entry)),
  )
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
