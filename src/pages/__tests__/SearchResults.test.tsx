import { isValidElement, type ReactElement } from 'react'
import { highlightText } from '../../utils/searchHighlight'

describe('highlightText', () => {
  it('highlights repeated matching terms', () => {
    const result = highlightText('data data DATA', 'data')

    const marked = result.filter((part) => isValidElement(part) && part.type === 'mark')
    expect(marked).toHaveLength(3)

    expect(
      marked.map((part) =>
        isValidElement(part) ? (part as ReactElement<{ children: string }>).props.children : part,
      ),
    ).toEqual(['data', 'data', 'DATA'])
  })

  it('matches mixed-case queries case-insensitively', () => {
    const result = highlightText('Python and pyThOn tips', 'PyThOn')

    const marked = result.filter((part) => isValidElement(part) && part.type === 'mark')
    expect(marked).toHaveLength(2)
    expect(
      marked.map((part) =>
        isValidElement(part) ? (part as ReactElement<{ children: string }>).props.children : part,
      ),
    ).toEqual(['Python', 'pyThOn'])
  })
})
