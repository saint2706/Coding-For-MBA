import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getStoredString, getStoredJson, setStoredString, removeStoredValue } from '../safeStorage'

describe('safeStorage', () => {
  let originalLocalStorage: Storage

  beforeEach(() => {
    vi.clearAllMocks()
    originalLocalStorage = global.localStorage

    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString()
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key]
        }),
        clear: vi.fn(() => {
          store = {}
        }),
        key: vi.fn((index: number) => Object.keys(store)[index] || null),
        get length() {
          return Object.keys(store).length
        },
      }
    })()

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  })

  afterEach(() => {
    global.localStorage = originalLocalStorage
  })

  describe('getStoredString', () => {
    it('should return the stored string if it exists', () => {
      localStorage.setItem('testKey', 'testValue')
      expect(getStoredString('testKey')).toBe('testValue')
    })

    it('should return null if the key does not exist and no fallback is provided', () => {
      expect(getStoredString('nonExistentKey')).toBeNull()
    })

    it('should return the fallback if the key does not exist', () => {
      expect(getStoredString('nonExistentKey', 'fallbackValue')).toBe('fallbackValue')
    })

    it('should return fallback if localStorage throws an error', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Access Denied')
      })
      expect(getStoredString('testKey', 'fallbackValue')).toBe('fallbackValue')
    })
  })

  describe('getStoredJson', () => {
    it('should return parsed JSON if it exists and is valid', () => {
      const testData = { a: 1, b: 'two' }
      localStorage.setItem('testKey', JSON.stringify(testData))
      expect(getStoredJson('testKey', { a: 0, b: '' })).toEqual(testData)
    })

    it('should return fallback if key does not exist', () => {
      expect(getStoredJson('nonExistentKey', { a: 0 })).toEqual({ a: 0 })
    })

    it('should return fallback if JSON parsing fails', () => {
      localStorage.setItem('testKey', 'invalid json')
      expect(getStoredJson('testKey', { a: 0 })).toEqual({ a: 0 })
    })

    it('should return fallback if validation fails', () => {
      localStorage.setItem('testKey', JSON.stringify({ a: 1 }))
      const validate = (val: unknown): val is { b: string } =>
        typeof val === 'object' && val !== null && 'b' in val

      expect(getStoredJson('testKey', { b: 'fallback' }, validate)).toEqual({ b: 'fallback' })
    })

    it('should return parsed JSON if validation passes', () => {
      const testData = { b: 'valid' }
      localStorage.setItem('testKey', JSON.stringify(testData))
      const validate = (val: unknown): val is { b: string } =>
        typeof val === 'object' && val !== null && 'b' in val

      expect(getStoredJson('testKey', { b: 'fallback' }, validate)).toEqual(testData)
    })

    it('should return fallback if parsed JSON is null', () => {
      localStorage.setItem('testKey', JSON.stringify(null))
      expect(getStoredJson('testKey', { a: 0 })).toEqual({ a: 0 })
    })
  })

  describe('setStoredString', () => {
    it('should set the string and return true on success', () => {
      expect(setStoredString('testKey', 'testValue')).toBe(true)
      expect(localStorage.getItem('testKey')).toBe('testValue')
    })

    it('should return false if localStorage throws an error', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Quota Exceeded')
      })
      expect(setStoredString('testKey', 'testValue')).toBe(false)
    })
  })

  describe('removeStoredValue', () => {
    it('should remove the value and return true on success', () => {
      localStorage.setItem('testKey', 'testValue')
      expect(removeStoredValue('testKey')).toBe(true)
      expect(localStorage.getItem('testKey')).toBeNull()
    })

    it('should return false if localStorage throws an error', () => {
      vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Access Denied')
      })
      expect(removeStoredValue('testKey')).toBe(false)
    })
  })
})
