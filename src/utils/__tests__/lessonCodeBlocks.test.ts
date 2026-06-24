import { describe, it, expect } from 'vitest'
import { extractLessonCodeBlocks, joinLessonCodeBlocks } from '../lessonCodeBlocks'

describe('extractLessonCodeBlocks', () => {
  it('extracts python and py fenced code blocks in order', () => {
    const content = [
      '# Lesson',
      '```python',
      'print("a")',
      '```',
      'Some text.',
      '```py',
      'print("b")',
      '```',
    ].join('\n')

    expect(extractLessonCodeBlocks(content)).toEqual(['print("a")', 'print("b")'])
  })

  it('ignores code blocks in other languages', () => {
    const content = '```bash\necho hi\n```\n```python\nprint("a")\n```'
    expect(extractLessonCodeBlocks(content)).toEqual(['print("a")'])
  })

  it('skips diff-flagged python fences', () => {
    const content = '```python diff\n+print("a")\n```\n```python\nprint("b")\n```'
    expect(extractLessonCodeBlocks(content)).toEqual(['print("b")'])
  })

  it('returns an empty array when there are no python code blocks', () => {
    expect(extractLessonCodeBlocks('# Just text\nNo code here.')).toEqual([])
  })
})

describe('joinLessonCodeBlocks', () => {
  it('joins blocks with numbered snippet headers', () => {
    const joined = joinLessonCodeBlocks(['print("a")', 'print("b")'])
    expect(joined).toBe('# --- Snippet 1 ---\nprint("a")\n\n# --- Snippet 2 ---\nprint("b")')
  })

  it('returns an empty string for no blocks', () => {
    expect(joinLessonCodeBlocks([])).toBe('')
  })
})
