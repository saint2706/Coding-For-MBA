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
  {
    day: '4',
    daySortKey: '00004:',
    title: 'Python Naming and Tooling',
    phase: 1,
    tags: ['style guide'],
    concepts: ['naming conventions'],
    content: `
### Variable Naming Conventions

In professional Python (following PEP 8 style guide):

\`\`\`python
# Variables and functions: snake_case
customer_lifetime_value = 2500
monthly-recurring-revenue = 45000
\`\`\`

- Read [NumPy Documentation](https://numpy.org/doc/)
- Review [Pandas Documentation](https://pandas.pydata.org/docs/)
1. Prefer clear names for feature-engineering pipelines.

Photon is Databricks' C++ query engine for SQL workloads.
`,
    path: '/fake/4',
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

  it('creates plain content without fence markers', () => {
    const docs = createSearchDocuments(lessons)
    expect(docs[0]?.plainContent).toContain('Variables store values')
    expect(docs[0]?.plainContent).toContain('print("ignore me")')
    expect(docs[0]?.plainContent).not.toContain('```python')
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

  it('preserves technical tokens from lesson markdown structures', () => {
    const docs = createSearchDocuments([lessons[3]!])
    const plain = docs[0]?.plainContent ?? ''

    expect(plain).toContain('snake_case')
    expect(plain).toContain('monthly-recurring-revenue')
    expect(plain).toContain('C++')
    expect(plain).toContain('NumPy Documentation')
    expect(plain).toContain('Pandas Documentation')
    expect(plain).not.toContain('```')
    expect(plain).not.toContain('[NumPy Documentation]')
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

  it('maintains recall for technical identifier queries', () => {
    const engine = createSearchEngine(lessons)

    expect(engine.search('snake_case')[0]?.item.day).toBe('4')
    expect(engine.search('c++ query engine')[0]?.item.day).toBe('4')
    expect(engine.search('numpy documentation')[0]?.item.day).toBe('4')
  })

  it('generates correct snippets', () => {
    const content =
      'This is a long text containing the keyword python in the middle of the sentence.'
    const snippet = getSearchSnippet(content, 'python', 20)
    expect(snippet).toContain('python')
    expect(snippet.length).toBeLessThan(50)
  })

  it('generates compact snippets for technical queries', () => {
    const doc = createSearchDocuments([lessons[3]!])[0]!
    const snippet = getSearchSnippet(doc.plainContent, 'c++ query engine', 28)

    expect(snippet.toLowerCase()).toContain('engine')
    expect(snippet.length).toBeLessThanOrEqual(65)
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

  it('starts background indexing using requestIdleCallback', async () => {
    vi.resetModules()
    const requestIdleCallback = vi.fn()
    window.requestIdleCallback = requestIdleCallback

    const { startBackgroundIndexing: startFreshIndexing } = await import('../searchIndex')
    startFreshIndexing()

    expect(requestIdleCallback).toHaveBeenCalled()
  })

  it('runs search function before chunks are processed', () => {
    const results = search('python')
    expect(results).toEqual([])
  })
})
