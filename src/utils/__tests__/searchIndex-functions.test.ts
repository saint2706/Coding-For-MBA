import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  createSearchDocuments,
  createSearchEngine,
  computeRankingBoost,
  getSearchSnippet,
  search,
  startBackgroundIndexing,
} from '../searchIndex'
import type { Lesson } from '../contentLoader'

const lessons: Lesson[] = [
  {
    day: '1',
    daySortKey: '00001:',
    title: 'Python Variables',
    phase: 1,
    tags: ['basics'],
    concepts: ['memory'],
    content: 'Variables store values. ```python\nprint("ignore me")\n```',
    path: '/fake/1',
  },
  {
    day: '2',
    daySortKey: '00002:',
    title: 'Intro',
    phase: 1,
    tags: ['python variables'],
    concepts: ['loops'],
    content: 'This lesson has no title match.',
    path: '/fake/2',
  },
  {
    day: '3',
    daySortKey: '00003:',
    title: 'Intro to loops',
    phase: 1,
    tags: ['control flow'],
    concepts: ['python variables'],
    content: 'Body also mentions python variables in plain text.',
    path: '/fake/3',
  },
]

// Mock getAllLessons if it was imported directly, but here passing lessons explicitly to createSearchDocuments
// However, search() calls getEngine() which calls getAllLessons(). So we need to mock it.
vi.mock('../contentLoader', () => ({
  getAllLessons: () => lessons,
}))

describe('search index', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('creates plain content without fenced code blocks', () => {
    const docs = createSearchDocuments(lessons)
    expect(docs[0]?.plainContent).toContain('Variables store values')
    expect(docs[0]?.plainContent).not.toContain('print("ignore me")')
  })

  it('strips complex markdown correctly', () => {
    // Force cast since we know lessons[0] is valid but TS inference is strict on the spread
    const complexLesson = {
      ...lessons[0],
      content: `
# Heading
* List item
1. Ordered item
[Link](url)
![Image](src)
\`inline code\`
\`\`\`python
block code
\`\`\`
**Bold**
_Italic_
`,
    } as Lesson

    const docs = createSearchDocuments([complexLesson])
    const plain = docs[0]?.plainContent

    // Should NOT contain markdown syntax
    expect(plain).toBeDefined()
    expect(plain).not.toContain('```')
    expect(plain).not.toContain('![')
    expect(plain).not.toContain('](')

    // Should contain text
    expect(plain).toContain('Heading')
    expect(plain).toContain('List item')
    expect(plain).toContain('Ordered item')
    expect(plain).toContain('Link')
    expect(plain).toContain('Bold')
    expect(plain).toContain('Italic')
  })

  it('applies stronger ranking for title > concepts > tags > body', () => {
    const docs = createSearchDocuments(lessons)
    const [titleDoc, tagDoc, conceptDoc] = docs

    const query = 'python variables'
    const titleBoost = computeRankingBoost(titleDoc!, query)
    const conceptBoost = computeRankingBoost(conceptDoc!, query)
    const tagBoost = computeRankingBoost(tagDoc!, query)

    expect(titleBoost).toBeGreaterThan(conceptBoost)
    expect(conceptBoost).toBeGreaterThan(tagBoost)
  })

  it('returns title match first from fuse search', () => {
    const engine = createSearchEngine(lessons)
    const results = engine.search('python variables')
    expect(results[0]?.item.day).toBe('1')
  })

  it('generates correct snippets', () => {
    const content =
      'This is a long text containing the keyword python in the middle of the sentence.'
    const snippet = getSearchSnippet(content, 'python', 20)
    expect(snippet).toContain('python')
    expect(snippet.length).toBeLessThan(50)
  })

  it('handles empty query in snippet', () => {
    const content = 'Some content'
    const snippet = getSearchSnippet(content, '')
    expect(snippet).toBe('Some content')
  })

  it('handles no match in snippet', () => {
    const content = 'Some content'
    const snippet = getSearchSnippet(content, 'keyword')
    expect(snippet).toBe('Some content…')
  })

  it('starts background indexing using requestIdleCallback', () => {
    const requestIdleCallback = vi.fn()
    window.requestIdleCallback = requestIdleCallback

    startBackgroundIndexing()

    expect(requestIdleCallback).toHaveBeenCalled()
  })

  it('runs search function', () => {
    const results = search('python')
    expect(results.length).toBeGreaterThan(0)
  })
})
