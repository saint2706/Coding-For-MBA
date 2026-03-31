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

/** A bonus file from a phase's extras/ folder. */
export interface ExtraFile {
  phase: number
  filename: string
  extension: string
  content: string
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

const extrasFiles = import.meta.glob(
  '/content/lessons/**/extras/**/*.{py,sql,csv,json,txt,md,ipynb}',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

let lessons: Lesson[] | null = null
let phases: Phase[] | null = null
let immutableLessons: readonly ImmutableLesson[] | null = null
let immutablePhases: readonly ImmutablePhase[] | null = null
let immutableLessonByDay: Map<DayToken, ImmutableLesson> | null = null
let immutableLessonsByPhase: Record<number, readonly ImmutableLesson[]> | null = null

function initializeContent() {
  if (lessons && phases) return

  lessons = Object.entries(lessonFiles)
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
        title: frontmatter.title || 'Untitled',
        phase: frontmatter.phase || 0,
        ...frontmatter,
        day,
        daySortKey: parsedDay?.sortKey || day,
        prerequisites,
        content,
        path,
      } as Lesson
    })
    .sort((a, b) => compareDayTokens(a.day, b.day))

  phases = Object.entries(phaseFiles)
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

  immutableLessons = Object.freeze(lessons.map(freezeLesson))
  immutablePhases = Object.freeze(phases.map(freezePhase))
  immutableLessonByDay = new Map(immutableLessons.map((lesson) => [lesson.day, lesson]))

  const byPhase: Record<number, Lesson[]> = {}
  for (const lesson of immutableLessons!) {
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

/**
 * Return all phases sorted by phase number.
 * Ensures that the content is initialized before returning.
 *
 * @returns {readonly ImmutablePhase[]} A read-only array of all phase objects.
 */
export function getAllPhases(): readonly ImmutablePhase[] {
  initializeContent()
  return immutablePhases!
}

/**
 * Retrieves a specific phase by its phase number.
 *
 * @param {string | number} phaseNum - The numeric identifier of the phase.
 * @returns {ImmutablePhase | undefined} The corresponding phase object or undefined if not found.
 */
export function getPhase(phaseNum: string | number): ImmutablePhase | undefined {
  initializeContent()
  return immutablePhases!.find((p) => p.phase === Number(phaseNum))
}

/**
 * Retrieves all lessons sorted chronologically by day token.
 * Ensures the lazy-loaded content cache is fully populated.
 *
 * @returns {readonly ImmutableLesson[]} A read-only array of all lesson objects.
 */
export function getAllLessons(): readonly ImmutableLesson[] {
  initializeContent()
  return immutableLessons!
}

/**
 * Retrieves a specific lesson by its day token or number.
 * Normalizes the input to handle both numeric ("1") and suffix ("36B") formats.
 *
 * @param {string | number} dayNum - The day token or number of the lesson.
 * @returns {ImmutableLesson | undefined} The corresponding lesson object or undefined if not found.
 */
export function getLesson(dayNum: string | number): ImmutableLesson | undefined {
  initializeContent()
  const dayToken = normalizeDayToken(dayNum)
  return immutableLessonByDay!.get(dayToken)
}

/**
 * Retrieves lessons associated with a specific phase, sorted chronologically.
 *
 * @param {string | number} phaseNum - The numeric identifier of the phase.
 * @returns {readonly ImmutableLesson[]} A read-only array of lesson objects for the given phase.
 */
export function getLessonsByPhase(phaseNum: string | number): readonly ImmutableLesson[] {
  initializeContent()
  return immutableLessonsByPhase![Number(phaseNum)] || []
}

/**
 * Return previous and next lessons around the given day.
 *
 * @param {string | number} dayNum - The day token or number of the lesson.
 * @returns {{ prev: ImmutableLesson | null; next: ImmutableLesson | null }} An object containing the previous and next lessons.
 */
export function getAdjacentLessons(dayNum: string | number): {
  prev: ImmutableLesson | null
  next: ImmutableLesson | null
} {
  initializeContent()
  const dayToken = normalizeDayToken(dayNum)
  const currentIndex = immutableLessons!.findIndex((l) => l.day === dayToken)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: currentIndex > 0 ? (immutableLessons![currentIndex - 1] ?? null) : null,
    next:
      currentIndex < immutableLessons!.length - 1
        ? (immutableLessons![currentIndex + 1] ?? null)
        : null,
  }
}

/** Exercise parsed from lesson markdown. */
export interface Exercise {
  id: string
  day: DayToken
  lessonTitle: string
  phase: number
  difficulty: string
  title: string
  goal: string
  starterCode: string
  expectedOutput?: string
  tags: readonly string[]
}

/**
 * Initial data used to create a spaced-repetition review card.
 * Extracts a prompt and answer from a lesson's concepts, headings, or exercises.
 */
export interface ReviewCardSeed {
  id: string
  day: DayToken
  phase: number
  lessonTitle: string
  sourceType: 'concept' | 'heading' | 'exercise'
  prompt: string
  answer: string
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

/** Parse exercise sections from a lesson markdown body. */
function extractExercisesFromLesson(lesson: Lesson): Exercise[] {
  const lessonIdPrefix = getLessonIdPrefix(lesson)
  return extractExercises(lesson.content).map((ex, index) => ({
    id: `${lessonIdPrefix}-exercise-${index + 1}-${normalizeIdPart(ex.title)}`,
    day: lesson.day,
    phase: lesson.phase,
    difficulty: lesson.difficulty || 'beginner',
    lessonTitle: lesson.title,
    title: ex.title,
    goal: ex.goal,
    starterCode: ex.starterCode,
    expectedOutput: ex.expectedOutput,
    tags: ex.tags.length > 0 ? ex.tags : (lesson.tags ?? []),
  }))
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

let immutableExercises: readonly ImmutableExercise[] | null = null
let immutableReviewCards: readonly ImmutableReviewCardSeed[] | null = null

/**
 * Return all parsed exercises across lessons.
 *
 * @returns {readonly ImmutableExercise[]} A read-only array of all parsed exercises.
 */
export function getAllExercises(): readonly ImmutableExercise[] {
  initializeContent()
  if (!immutableExercises) {
    const allExercises = lessons!.flatMap(extractExercisesFromLesson)
    immutableExercises = Object.freeze(allExercises.map(freezeExercise))
  }
  return immutableExercises
}

/**
 * Retrieves all review card seeds from the lessons.
 * Seeds are used to initialize the spaced repetition review system.
 *
 * @returns {readonly ImmutableReviewCardSeed[]} An immutable array of review card seeds extracted from all lessons.
 */
export function getAllReviewCardSeeds(): readonly ImmutableReviewCardSeed[] {
  initializeContent()
  if (!immutableReviewCards) {
    const cards = lessons!.flatMap(buildReviewCardsFromLesson)
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
  parseError?: {
    path: string
    phase: number
    message: string
  }
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
    .map(([path, raw]) =>
      parseNotebookEntry(path, raw, { attachParseError: Boolean(import.meta.env.DEV) }),
    )
    .sort((a, b) => a.phase - b.phase)
}

type ParseNotebookEntryOptions = {
  attachParseError?: boolean
}

/**
 * Parses a raw JSON string representing a Jupyter notebook.
 * Extracts basic metadata and structural information.
 *
 * @param {string} path - The relative file path to the notebook file.
 * @param {string} raw - The raw JSON string of the notebook.
 * @param {ParseNotebookEntryOptions} [options={}] - Options for parsing.
 * @returns {Notebook} The parsed notebook object.
 */
export function parseNotebookEntry(
  path: string,
  raw: string,
  options: ParseNotebookEntryOptions = {},
): Notebook {
  const phaseMatch = path.match(/Phase_(\d+)/)
  const phaseValue = phaseMatch?.[1]
  const phase = phaseValue ? parseInt(phaseValue, 10) : 0

  try {
    const nb = JSON.parse(raw) as { cells?: NotebookCell[] }
    return { phase, cells: nb.cells || [] }
  } catch (error) {
    console.warn(
      `[contentLoader] Failed to parse notebook JSON for phase ${phase} at ${path}.`,
      error,
    )

    const message = error instanceof Error ? error.message : String(error)
    return {
      phase,
      cells: [],
      parseError: options.attachParseError
        ? {
            path,
            phase,
            message,
          }
        : undefined,
    }
  }
}

let immutableNotebooks: readonly ImmutableNotebook[] | null = null
let totalReadingTimeCache: number | null = null

/**
 * Retrieves the total estimated reading time (in minutes) for all lessons.
 * The value is computed once and cached to optimize render performance.
 *
 * @returns {number} The total reading time across the curriculum.
 */
export function getTotalReadingTime(): number {
  if (totalReadingTimeCache === null) {
    const allLessons = getAllLessons()
    totalReadingTimeCache = allLessons.reduce(
      (sum, lesson) => sum + getReadingTime(lesson.content),
      0,
    )
  }
  return totalReadingTimeCache
}

let curriculumMetadataCache: {
  totalDays: number
  totalPhases: number
  totalLevels: number
} | null = null

/**
 * Retrieves cached curriculum metadata.
 *
 * @returns {{ totalDays: number; totalPhases: number; totalLevels: number }} The total number of days, phases, and difficulty levels.
 */
export function getCurriculumMetadata(): {
  totalDays: number
  totalPhases: number
  totalLevels: number
} {
  if (curriculumMetadataCache === null) {
    const allLessons = getAllLessons()
    const allPhases = getAllPhases()
    const totalDays = allLessons.length
    const totalPhases = allPhases.length

    // Calculate unique difficulty levels
    const uniqueLevels = new Set(allLessons.map((l) => l.difficulty || 'beginner'))
    const totalLevels = uniqueLevels.size

    curriculumMetadataCache = { totalDays, totalPhases, totalLevels }
  }
  return curriculumMetadataCache
}

let contentStatsCache: {
  lessonCount: number
  phaseCount: number
  totalWords: number
  totalReadingMins: number
  difficultyMap: Record<string, number>
  tagCloud: [string, number][]
  phaseStats: {
    phase: number
    title: string
    lessonCount: number
    totalWords: number
    totalReadingTime: number
  }[]
  topConcepts: [string, number][]
} | null = null

/**
 * Retrieves comprehensive content statistics for the curriculum.
 * The statistics are computed once and cached to avoid O(N) recalculations on render.
 */
export function getContentStats() {
  if (contentStatsCache === null) {
    const lessons = getAllLessons()
    const phases = getAllPhases()

    const getWordCount = (markdown: string) => {
      const plainText = markdown.replace(/```[\s\S]*?```/g, '').replace(/[#*_>`()!-]/g, '')
      return plainText.split(/\s+/).filter(Boolean).length
    }

    const lessonMetrics = lessons.map((l) => ({
      phase: l.phase,
      difficulty: (l.difficulty as string) || 'unknown',
      tags: ((l.tags as string[]) || []).map((t) => t.trim()).filter(Boolean),
      concepts: ((l.concepts as string[]) || []).map((c) => c.trim()).filter(Boolean),
      wordCount: getWordCount(l.content),
      readingTime: getReadingTime(l.content),
    }))

    // Total word count
    const totalWords = lessonMetrics.reduce((sum, l) => sum + l.wordCount, 0)
    const totalReadingMins = lessonMetrics.reduce((sum, l) => sum + l.readingTime, 0)

    // Difficulty breakdown
    const difficultyMap: Record<string, number> = {}
    for (const l of lessonMetrics) {
      difficultyMap[l.difficulty] = (difficultyMap[l.difficulty] || 0) + 1
    }

    // Tag cloud
    const tagMap: Record<string, number> = {}
    for (const l of lessonMetrics) {
      for (const t of l.tags) {
        tagMap[t] = (tagMap[t] || 0) + 1
      }
    }
    const tagCloud = Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)

    // Phase stats
    const phaseStats = phases.map((p) => {
      const phaseLessons = lessonMetrics.filter((l) => l.phase === p.phase)
      return {
        phase: p.phase,
        title: p.title,
        lessonCount: phaseLessons.length,
        totalWords: phaseLessons.reduce((sum, l) => sum + l.wordCount, 0),
        totalReadingTime: phaseLessons.reduce((sum, l) => sum + l.readingTime, 0),
      }
    })

    // Concept stats
    const conceptMap: Record<string, number> = {}
    for (const l of lessonMetrics) {
      for (const c of l.concepts) {
        conceptMap[c] = (conceptMap[c] || 0) + 1
      }
    }
    const topConcepts = Object.entries(conceptMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)

    contentStatsCache = {
      lessonCount: lessons.length,
      phaseCount: phases.length,
      totalWords,
      totalReadingMins,
      difficultyMap,
      tagCloud,
      phaseStats,
      topConcepts,
    }
  }
  return contentStatsCache
}

/**
 * Retrieves all valid parsed Jupyter notebooks available in the project.
 * Uses lazy loading to delay instantiation until the first request.
 *
 * @returns {readonly ImmutableNotebook[]} A read-only array of available notebook objects.
 */
export function getAllNotebooks(): readonly ImmutableNotebook[] {
  if (!immutableNotebooks) {
    const notebooks = parseNotebooks()
    immutableNotebooks = Object.freeze(notebooks.map(freezeNotebook))
  }
  return immutableNotebooks
}

/**
 * Return a notebook by phase number.
 *
 * @param {string | number} phaseNum - The numeric identifier of the phase.
 * @returns {ImmutableNotebook | undefined} The corresponding notebook object or undefined if not found.
 */
export function getNotebook(phaseNum: string | number): ImmutableNotebook | undefined {
  return getAllNotebooks().find((n) => n.phase === Number(phaseNum))
}

/**
 * Estimate reading time in minutes after removing markdown syntax noise.
 *
 * @param {string} content - The markdown content to calculate reading time for.
 * @returns {number} The estimated reading time in minutes.
 */
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

/**
 * Retrieves the required prerequisite lessons for a given lesson based on frontmatter fields.
 * Validates cross-reference strings against available day tokens.
 *
 * @param {Readonly<Lesson>} lesson - The target lesson object to find prerequisites for.
 * @returns {readonly ImmutableLesson[]} A read-only array of prerequisite lesson objects.
 */
export function getPrerequisiteLessons(lesson: Readonly<Lesson>): readonly ImmutableLesson[] {
  initializeContent()
  const prereqs = lesson.prerequisites as readonly unknown[] | undefined
  if (!prereqs || !Array.isArray(prereqs) || prereqs.length === 0) return []
  return prereqs
    .map((day) => dayTokenFromReference(day))
    .map((day) => (day ? immutableLessonByDay!.get(day) : undefined))
    .filter((l): l is ImmutableLesson => l !== undefined)
}

/** Return top related lessons ranked by shared tags/concepts and phase proximity. */
let relatedLessonsCache: Record<string, readonly ImmutableLesson[]> = {}

/**
 * Retrieves a list of related lessons for a given lesson based on shared tags.
 * Results are sorted by the number of matching tags, descending.
 *
 * @param {Readonly<Lesson>} lesson - The target lesson object to find related content for.
 * @param {number} [count=4] - The maximum number of related lessons to return.
 * @returns {readonly ImmutableLesson[]} A read-only array of related lesson objects, up to the specified count limit.
 */
export function getRelatedLessons(lesson: Readonly<Lesson>, count = 4): readonly ImmutableLesson[] {
  initializeContent()
  const cacheKey = `${lesson.day}-${count}`
  if (relatedLessonsCache[cacheKey]) {
    return relatedLessonsCache[cacheKey]!
  }

  const prereqs = new Set(
    ((lesson.prerequisites as readonly unknown[]) || [])
      .map((entry) => dayTokenFromReference(entry))
      .filter((entry): entry is DayToken => Boolean(entry)),
  )
  const myTags = new Set((lesson.tags as readonly string[]) || [])
  const myConcepts = new Set((lesson.concepts as readonly string[]) || [])

  const scored = lessons!
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

  const result = Object.freeze(
    scored.map((s) =>
      Object.freeze({
        ...s.lesson,
        _sharedTags: Object.freeze([...s.sharedTags]),
        tags: freezeStringArray(s.lesson.tags),
        concepts: freezeStringArray(s.lesson.concepts),
      }),
    ),
  )

  relatedLessonsCache[cacheKey] = result
  return result
}

export { difficultyConfig, phaseIcons }

/** Shared shape for a case study or capstone project entry. */
export interface ProjectLike {
  slug: string
  title: string
  difficulty: string
  estimatedTime: string
  phasesCovered: string
  content: string
  path: string
}

/** A case study entry parsed from a case-studies README. */
export type CaseStudy = ProjectLike

/** A project entry parsed from a projects README. */
export type Project = ProjectLike

const caseStudyFiles = import.meta.glob('/content/case-studies/**/README.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const projectFiles = import.meta.glob('/content/projects/**/README.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseProjectLikeEntry(
  path: string,
  raw: string,
): {
  title: string
  difficulty: string
  estimatedTime: string
  phasesCovered: string
  slug: string
} {
  const titleMatch = raw.match(/^#\s+(.+)$/m)
  const title = titleMatch?.[1]?.trim() ?? 'Untitled'

  const difficultyMatch = raw.match(/\*\*Difficulty\*\*:\s*(.+)/)
  const difficulty = difficultyMatch?.[1]?.trim() ?? 'Intermediate'

  const timeMatch = raw.match(/\*\*Estimated time\*\*:\s*(.+)/)
  const estimatedTime = timeMatch?.[1]?.trim() ?? ''

  const phasesMatch = raw.match(/\*\*Phases covered\*\*:\s*(.+)/)
  const phasesCovered = phasesMatch?.[1]?.trim() ?? ''

  const segments = path.split('/')
  const slug = segments[segments.length - 2] || path

  return { title, difficulty, estimatedTime, phasesCovered, slug }
}

let immutableCaseStudies: readonly Readonly<CaseStudy>[] | null = null
let immutableProjects: readonly Readonly<Project>[] | null = null

/**
 * Retrieves all valid parsed case studies available in the project.
 * Uses lazy loading to delay instantiation until the first request.
 *
 * @returns {readonly Readonly<CaseStudy>[]} A read-only array of available case study objects.
 */
export function getAllCaseStudies(): readonly Readonly<CaseStudy>[] {
  if (!immutableCaseStudies) {
    const parsed = Object.entries(caseStudyFiles)
      .map(([path, raw]) => {
        const meta = parseProjectLikeEntry(path, raw)
        return Object.freeze({ ...meta, content: raw, path })
      })
      .sort((a, b) => a.slug.localeCompare(b.slug))
    immutableCaseStudies = Object.freeze(parsed)
  }
  return immutableCaseStudies
}

/**
 * Retrieves all valid parsed capstone projects available in the project.
 * Uses lazy loading to delay instantiation until the first request.
 *
 * @returns {readonly Readonly<Project>[]} A read-only array of available project objects.
 */
export function getAllProjects(): readonly Readonly<Project>[] {
  if (!immutableProjects) {
    const parsed = Object.entries(projectFiles)
      .map(([path, raw]) => {
        const meta = parseProjectLikeEntry(path, raw)
        return Object.freeze({ ...meta, content: raw, path })
      })
      .sort((a, b) => a.slug.localeCompare(b.slug))
    immutableProjects = Object.freeze(parsed)
  }
  return immutableProjects
}

let immutableExtrasByPhase: Record<number, readonly Readonly<ExtraFile>[]> | null = null

function parseExtras(): Record<number, ExtraFile[]> {
  const byPhase: Record<number, ExtraFile[]> = {}
  for (const [path, raw] of Object.entries(extrasFiles)) {
    const phaseMatch = path.match(/Phase_(\d+)/)
    if (!phaseMatch?.[1]) continue
    const phase = parseInt(phaseMatch[1], 10)
    const filename = path.split('/').pop() || 'unknown'
    const dotIndex = filename.lastIndexOf('.')
    const extension = dotIndex > 0 ? filename.slice(dotIndex + 1) : ''
    if (!byPhase[phase]) byPhase[phase] = []
    byPhase[phase].push({ phase, filename, extension, content: raw })
  }
  for (const list of Object.values(byPhase)) {
    list.sort((a, b) => a.filename.localeCompare(b.filename))
  }
  return byPhase
}

/**
 * Retrieves all extra files (projects, case studies, notebooks) associated with a specific phase.
 *
 * @param {string | number} phaseNum - The numeric identifier of the phase.
 * @returns {readonly Readonly<ExtraFile>[]} A read-only array of extra files for the phase.
 */
export function getExtrasForPhase(phaseNum: string | number): readonly Readonly<ExtraFile>[] {
  if (!immutableExtrasByPhase) {
    const parsed = parseExtras()
    const frozen: Record<number, readonly Readonly<ExtraFile>[]> = {}
    for (const [p, list] of Object.entries(parsed)) {
      frozen[Number(p)] = Object.freeze(list.map((f) => Object.freeze({ ...f })))
    }
    immutableExtrasByPhase = frozen
  }
  return immutableExtrasByPhase[Number(phaseNum)] || []
}
