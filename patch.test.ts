import { describe, it, expect } from 'vitest'
import { safeStorage } from './src/utils/safeStorage'

describe('safeStorage', () => {
  it('handles setItem correctly', () => {
    safeStorage.setItem('test', 'value')
    expect(safeStorage.getItem('test')).toBe('value')
  })
})
