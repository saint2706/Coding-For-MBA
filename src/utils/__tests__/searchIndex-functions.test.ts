import { describe, expect, it } from 'vitest'
import { createSearchDocuments, createSearchEngine, computeRankingBoost } from '../searchIndex'
import type { Lesson } from '../contentLoader'

const lessons: Lesson[] = [
  {
    day: 1,
    title: 'Python Variables',
    phase: 1,
    tags: ['basics'],
    concepts: ['memory'],
    content: 'Variables store values. ```python\nprint("ignore me")\n```',
    path: '/fake/1',
  },
  {
    day: 2,
    title: 'Intro',
    phase: 1,
    tags: ['python variables'],
    concepts: ['loops'],
    content: 'This lesson has no title match.',
    path: '/fake/2',
  },
  {
    day: 3,
    title: 'Intro to loops',
    phase: 1,
    tags: ['control flow'],
    concepts: ['python variables'],
    content: 'Body also mentions python variables in plain text.',
    path: '/fake/3',
  },
]

describe('search index', () => {
  it('creates plain content without fenced code blocks', () => {
    const docs = createSearchDocuments(lessons)
    expect(docs[0]?.plainContent).toContain('Variables store values')
    expect(docs[0]?.plainContent).not.toContain('print("ignore me")')
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
    expect(results[0]?.item.day).toBe(1)
  })
})
