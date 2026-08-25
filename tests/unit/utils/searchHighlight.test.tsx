import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { highlightText } from '../../../src/utils/searchHighlight'

describe('highlightText', () => {
  it('returns original string when no search terms are provided', () => {
    const result = highlightText('Hello world', [])
    expect(result).toEqual(['Hello world'])
  })

  it('highlights a single term correctly', () => {
    const result = highlightText('Hello world', ['world'])
    const { container } = render(<>{result}</>)
    const mark = container.querySelector('mark')
    expect(mark).toBeInTheDocument()
    expect(mark).toHaveTextContent('world')
    expect(container).toHaveTextContent('Hello world')
  })

  it('highlights multiple terms correctly', () => {
    const result = highlightText('The quick brown fox jumps over the lazy dog', ['quick', 'fox'])
    const { container } = render(<>{result}</>)
    const marks = container.querySelectorAll('mark')
    expect(marks).toHaveLength(2)
    expect(marks[0]).toHaveTextContent('quick')
    expect(marks[1]).toHaveTextContent('fox')
  })

  it('is case insensitive', () => {
    const result = highlightText('Hello World', ['world'])
    const { container } = render(<>{result}</>)
    const mark = container.querySelector('mark')
    expect(mark).toBeInTheDocument()
    expect(mark).toHaveTextContent('World')
  })

  it('handles partial matches', () => {
    const result = highlightText('Understanding python loops', ['under'])
    const { container } = render(<>{result}</>)
    const mark = container.querySelector('mark')
    expect(mark).toBeInTheDocument()
    expect(mark).toHaveTextContent('Under')
    expect(container).toHaveTextContent('Understanding python loops')
  })
})
