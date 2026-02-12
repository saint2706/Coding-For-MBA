import { parseMarkdown } from './frontmatter'

/** Lesson metadata and markdown body loaded from a lesson README. */
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

/** UI token set for rendering difficulty badges. */
export interface DifficultyInfo {
  label: string
  color: string
  bg: string
}

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

const allExercises: Exercise[] = lessons.flatMap(extractExercisesFromLesson)
const immutableLessons = Object.freeze(lessons.map(freezeLesson))
const immutablePhases = Object.freeze(phases.map(freezePhase))
const immutableExercises = Object.freeze(allExercises.map(freezeExercise))

/** Return all parsed exercises across lessons. */
export function getAllExercises(): readonly ImmutableExercise[] {
  return immutableExercises
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

const notebooks = parseNotebooks()
const immutableNotebooks = Object.freeze(notebooks.map(freezeNotebook))

/** Return all parsed notebooks sorted by phase number. */
export function getAllNotebooks(): readonly ImmutableNotebook[] {
  return immutableNotebooks
}

/** Return a notebook by phase number. */
export function getNotebook(phaseNum: string | number): ImmutableNotebook | undefined {
  return immutableNotebooks.find((n) => n.phase === Number(phaseNum))
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

/** Difficulty-level display metadata used by the lesson UI. */
export const difficultyConfig: Record<string, DifficultyInfo> = {
  beginner: { label: 'Beginner', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  intermediate: { label: 'Intermediate', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  advanced: { label: 'Advanced', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  expert: { label: 'Expert', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
}

/** Phase icon lookup (index 0 => phase 1). */
export const phaseIcons: string[] = ['🐍', '🔧', '🌐', '📐', '🧠', '🚀', '📊', '🗄️', '⚡']
