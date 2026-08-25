import { getGlossaryRegex, glossaryTerms } from '../../../src/utils/glossary'

describe('glossary', () => {
  it('builds a case-insensitive regex matching glossary terms', () => {
    const regex = getGlossaryRegex()
    expect(regex.test('We study MACHINE LEARNING every day.')).toBe(true)
    expect(regex.test('nonsenseword')).toBe(false)
  })

  it('contains expected high-value terms', () => {
    expect(glossaryTerms['machine learning']).toBeDefined()
    expect(glossaryTerms.SQL).toContain('Structured Query Language')
  })

  it('prioritizes longer multi-word terms', () => {
    const regex = getGlossaryRegex()
    const match = 'machine learning'.match(regex)
    expect(match?.[0].toLowerCase()).toBe('machine learning')
  })
})
