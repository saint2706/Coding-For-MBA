/**
 * Toast Notification Wrapper
 *
 * Configures and wraps `react-hot-toast` for consistent application-wide notifications.
 *
 * Key Responsibilities:
 * - Define default styling and themes for success/error/info toasts.
 * - Export simplified helper functions (toastSuccess, toastError).
 */

import { toast, type DefaultToastOptions, type ToastOptions } from 'react-hot-toast'

export const TOAST_DEFAULT_OPTIONS: DefaultToastOptions = {
  duration: 3500,
  style: {
    background: 'var(--bg-elevated, #1f2937)',
    color: 'var(--text-primary, #f9fafb)',
    border: '1px solid var(--border-color, #374151)',
  },
  success: {
    iconTheme: {
      primary: '#22c55e',
      secondary: '#f9fafb',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#f9fafb',
    },
  },
}

export const toastSuccess = (message: string, options?: ToastOptions): string =>
  toast.success(message, options)

export const toastError = (message: string, options?: ToastOptions): string =>
  toast.error(message, options)

export const toastInfo = (message: string, options?: ToastOptions): string =>
  toast(message, options)
