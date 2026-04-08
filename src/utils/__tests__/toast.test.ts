import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toast } from 'react-hot-toast'
import { toastSuccess, toastError, toastInfo, TOAST_DEFAULT_OPTIONS } from '../toast'

vi.mock('react-hot-toast', () => {
  const toastMock = vi.fn() as unknown as {
    (message: string, options?: import('react-hot-toast').ToastOptions): string
    success: import('vitest').Mock
    error: import('vitest').Mock
  }
  toastMock.success = vi.fn()
  toastMock.error = vi.fn()
  return {
    toast: toastMock,
  }
})

describe('toast utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('toastSuccess', () => {
    it('should call toast.success with the correct message and options', () => {
      // Arrange
      const message = 'Success message'
      const options = { duration: 2000 }

      // Act
      toastSuccess(message, options)

      // Assert
      expect(toast.success).toHaveBeenCalledWith(message, options)
    })

    it('should call toast.success with only the message when options are omitted', () => {
      // Arrange
      const message = 'Success message'

      // Act
      toastSuccess(message)

      // Assert
      expect(toast.success).toHaveBeenCalledWith(message, undefined)
    })
  })

  describe('toastError', () => {
    it('should call toast.error with the correct message and options', () => {
      // Arrange
      const message = 'Error message'
      const options = { duration: 5000 }

      // Act
      toastError(message, options)

      // Assert
      expect(toast.error).toHaveBeenCalledWith(message, options)
    })

    it('should call toast.error with only the message when options are omitted', () => {
      // Arrange
      const message = 'Error message'

      // Act
      toastError(message)

      // Assert
      expect(toast.error).toHaveBeenCalledWith(message, undefined)
    })
  })

  describe('toastInfo', () => {
    it('should call toast with the correct message and options', () => {
      // Arrange
      const message = 'Info message'
      const options = { duration: 3000 }

      // Act
      toastInfo(message, options)

      // Assert
      expect(toast).toHaveBeenCalledWith(message, options)
    })

    it('should call toast with only the message when options are omitted', () => {
      // Arrange
      const message = 'Info message'

      // Act
      toastInfo(message)

      // Assert
      expect(toast).toHaveBeenCalledWith(message, undefined)
    })
  })

  describe('TOAST_DEFAULT_OPTIONS', () => {
    it('should have the correct default options defined', () => {
      // Assert
      expect(TOAST_DEFAULT_OPTIONS.duration).toBe(3500)
      expect(TOAST_DEFAULT_OPTIONS.style).toBeDefined()
      expect(TOAST_DEFAULT_OPTIONS.success).toBeDefined()
      expect(TOAST_DEFAULT_OPTIONS.error).toBeDefined()
    })
  })
})
