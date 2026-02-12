// Simple browser-compatible frontmatter parser (no Node.js deps)

interface Frontmatter {
  [key: string]: string | number | boolean | (string | number)[]
}

interface ParsedMarkdown {
  frontmatter: Frontmatter
  content: string
}

function parseMarkdown(raw: string): ParsedMarkdown {
  // Normalize line endings to \n
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Split on frontmatter delimiters
  if (!normalized.startsWith('---\n'))
    return { frontmatter: Object.create(null), content: normalized }

  const endIndex = normalized.indexOf('\n---\n', 4)
  if (endIndex === -1) return { frontmatter: Object.create(null), content: normalized }

  const yamlStr = normalized.slice(4, endIndex)
  const content = normalized.slice(endIndex + 5)
  const frontmatter: Frontmatter = Object.create(null)

  let currentKey: string | null = null
  let currentArray: (string | number)[] | null = null

  for (const line of yamlStr.split('\n')) {
    // Array item: "  - value"
    const arrayMatch = line.match(/^\s+-\s+(.+)$/)
    if (arrayMatch && currentKey) {
      if (!currentArray) {
        currentArray = []
        frontmatter[currentKey] = currentArray
      }
      let val = arrayMatch[1]!.trim()
      val = val.replace(/^["']|["']$/g, '')
      currentArray.push(isNaN(Number(val)) ? val : Number(val))
      continue
    }

    // Key-value: "key: value"
    const kvMatch = line.match(/^(\w+):\s*(.*)$/)
    if (kvMatch) {
      const key = kvMatch[1]!
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        currentKey = null
        currentArray = null
        continue
      }

      currentKey = key
      currentArray = null
      let val = kvMatch[2]!.trim()

      if (val === '') {
        // Next lines might be array items
        continue
      }

      // Inline array: [1, 2, 3]
      const inlineArray = val.match(/^\[(.*)\]$/)
      if (inlineArray) {
        frontmatter[currentKey] = inlineArray[1]!
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .map((s) => (isNaN(Number(s)) ? s : Number(s)))
        continue
      }

      // Remove quotes
      val = val.replace(/^["']|["']$/g, '')

      // Type coercion
      if (val === 'true') frontmatter[currentKey] = true
      else if (val === 'false') frontmatter[currentKey] = false
      else if (!isNaN(Number(val)) && val !== '') frontmatter[currentKey] = Number(val)
      else frontmatter[currentKey] = val
    }
  }

  return { frontmatter, content }
}

// --- Public types ---

export interface Lesson {
  day: number
  title: string
  phase: number
  difficulty?: string
  duration?: number
  tags?: string[]
  concepts?: string[]
  content: string
  path: string
  [key: string]: unknown
}

export interface Phase {
  phase: number
  title: string
  difficulty?: string
  totalDuration?: number
  days?: number[]
  content: string
  path: string
  [key: string]: unknown
}

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

export function getAllPhases(): Phase[] {
  return phases
}

export function getPhase(phaseNum: string | number): Phase | undefined {
  return phases.find((p) => p.phase === Number(phaseNum))
}

export function getAllLessons(): Lesson[] {
  return lessons
}

export function getLesson(dayNum: string | number): Lesson | undefined {
  return lessons.find((l) => l.day === Number(dayNum))
}

export function getLessonsByPhase(phaseNum: string | number): Lesson[] {
  return lessons.filter((l) => l.phase === Number(phaseNum))
}

export function getAdjacentLessons(dayNum: string | number): {
  prev: Lesson | null
  next: Lesson | null
} {
  const day = Number(dayNum)
  const currentIndex = lessons.findIndex((l) => l.day === day)
  return {
    prev: currentIndex > 0 ? lessons[currentIndex - 1]! : null,
    next: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1]! : null,
  }
}

// --- Exercise extraction ---

export interface Exercise {
  day: number
  lessonTitle: string
  phase: number
  difficulty: string
  title: string
  goal: string
  starterCode: string
  tags: string[]
}

function extractExercisesFromLesson(lesson: Lesson): Exercise[] {
  const exercises: Exercise[] = []
  const regex =
    /### Exercise \d+:\s*(.+?)\n([\s\S]*?)(?=\n### Exercise \d+:|\n## |\n---\s*\n## |$)/g
  let match
  while ((match = regex.exec(lesson.content)) !== null) {
    const title = match[1]!.trim()
    const body = match[2]!
    const goalMatch = body.match(/\*\*Goal\*\*:\s*(.+)/)
    const goal = goalMatch ? goalMatch[1]!.trim() : ''
    const codeRegex = /```(?:python|py)\s*\n([\s\S]*?)```/g
    let codeMatch
    const codeBlocks: string[] = []
    while ((codeMatch = codeRegex.exec(body)) !== null) {
      codeBlocks.push(codeMatch[1]!.trim())
    }
    exercises.push({
      day: lesson.day,
      lessonTitle: lesson.title,
      phase: lesson.phase,
      difficulty: lesson.difficulty || 'beginner',
      title,
      goal,
      starterCode: codeBlocks[0] || '',
      tags: (lesson.tags as string[]) || [],
    })
  }
  return exercises
}

const allExercises: Exercise[] = lessons.flatMap(extractExercisesFromLesson)

export function getAllExercises(): Exercise[] {
  return allExercises
}

// --- Notebook loading ---

export interface NotebookCell {
  cell_type: 'code' | 'markdown' | 'raw'
  source: string[]
  outputs?: Array<{
    output_type: string
    text?: string[]
    data?: Record<string, string[]>
    ename?: string
    evalue?: string
    traceback?: string[]
  }>
  execution_count?: number | null
}

export interface Notebook {
  phase: number
  cells: NotebookCell[]
}

const notebookFiles = import.meta.glob('/Lessons/**/Phase_*_Solutions.ipynb', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseNotebooks(): Notebook[] {
  return Object.entries(notebookFiles)
    .map(([path, raw]) => {
      const phaseMatch = path.match(/Phase_(\d+)/)
      const phase = phaseMatch ? parseInt(phaseMatch[1]!, 10) : 0
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

export function getAllNotebooks(): Notebook[] {
  return notebooks
}

export function getNotebook(phaseNum: string | number): Notebook | undefined {
  return notebooks.find((n) => n.phase === Number(phaseNum))
}

// Difficulty config
export const difficultyConfig: Record<string, DifficultyInfo> = {
  beginner: { label: 'Beginner', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  intermediate: { label: 'Intermediate', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  advanced: { label: 'Advanced', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  expert: { label: 'Expert', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
}

// Phase icons
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
