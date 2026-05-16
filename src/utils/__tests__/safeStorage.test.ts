import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getStoredString, getStoredJson, setStoredString, removeStoredValue } from '../safeStorage'

describe('safeStorage', () => {
  let originalLocalStorage: Storage

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    originalLocalStorage = window.localStorage
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    })
  })

  describe('getStoredString', () => {
    it('returns value from localStorage if exists', () => {
      localStorage.setItem('test_key', 'test_value')
      expect(getStoredString('test_key')).toBe('test_value')
    })

    it('returns defaultValue if key does not exist', () => {
      expect(getStoredString('non_existent_key', 'default_val')).toBe('default_val')
    })

    it('returns null if key does not exist and no defaultValue provided', () => {
      expect(getStoredString('non_existent_key')).toBeNull()
    })

    it('handles localStorage throwing an error', () => {
      const mockLocalStorage = {
        getItem: vi.fn().mockImplementation(() => {
          throw new Error('Storage disabled')
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      })
      expect(getStoredString('test_key', 'fallback')).toBe('fallback')
      expect(getStoredString('test_key')).toBeNull()
    })
  })

  describe('getStoredJson', () => {
    it('returns parsed object when valid json exists', () => {
      localStorage.setItem('json_key', JSON.stringify({ a: 1 }))
      expect(getStoredJson('json_key', { b: 2 })).toEqual({ a: 1 })
    })

    it('returns fallback when storage is empty', () => {
      expect(getStoredJson('empty_key', { fallback: true })).toEqual({ fallback: true })
    })

    it('returns fallback when json is invalid', () => {
      localStorage.setItem('invalid_json', '{ bad json }')
      expect(getStoredJson('invalid_json', { fallback: true })).toEqual({ fallback: true })
    })

    it('returns fallback when parsed type mismatch object', () => {
      localStorage.setItem('mismatch', JSON.stringify('string_val'))
      expect(getStoredJson('mismatch', { fallback: true })).toEqual({ fallback: true })
    })

    it('returns fallback when parsed type mismatch array', () => {
      localStorage.setItem('mismatch_arr', JSON.stringify({ a: 1 }))
      expect(getStoredJson('mismatch_arr', [1, 2])).toEqual([1, 2])
    })

    it('returns fallback when parsed type mismatch primitive', () => {
      localStorage.setItem('mismatch_prim', JSON.stringify({ a: 1 }))
      expect(getStoredJson('mismatch_prim', 'string_val')).toEqual('string_val')
    })

    it('uses optional validate function', () => {
      localStorage.setItem('valid_key', JSON.stringify({ a: 1, b: 2 }))
      const validate = (val: any): val is { a: number; b: number } =>
        val && typeof val.a === 'number'
      expect(getStoredJson('valid_key', { a: 0, b: 0 }, validate)).toEqual({ a: 1, b: 2 })

      localStorage.setItem('invalid_validate', JSON.stringify({ a: 'string', b: 2 }))
      expect(getStoredJson('invalid_validate', { a: 0, b: 0 }, validate)).toEqual({ a: 0, b: 0 })
    })
  })

  describe('setStoredString', () => {
    it('sets value in localStorage and returns true', () => {
      const result = setStoredString('test_key', 'new_value')
      expect(result).toBe(true)
      expect(localStorage.getItem('test_key')).toBe('new_value')
    })

    it('returns false if localStorage throws an error', () => {
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn().mockImplementation(() => {
          throw new Error('Quota exceeded')
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      })
      const result = setStoredString('test_key', 'new_value')
      expect(result).toBe(false)
    })
  })

  describe('removeStoredValue', () => {
    it('removes value from localStorage and returns true', () => {
      localStorage.setItem('test_key', 'value_to_remove')
      const result = removeStoredValue('test_key')
      expect(result).toBe(true)
      expect(localStorage.getItem('test_key')).toBeNull()
    })

    it('returns false if localStorage throws an error', () => {
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn().mockImplementation(() => {
          throw new Error('Storage error')
        }),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      })
      const result = removeStoredValue('test_key')
      expect(result).toBe(false)
    })
  })
})
