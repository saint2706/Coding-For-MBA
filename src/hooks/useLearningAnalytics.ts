/**
 * Learning Analytics Hook
 *
 * Automatically tracks page visits and session duration for learning analytics.
 * Connects the current route to the `learningAnalyticsStore`.
 *
 * Key Responsibilities:
 * - Start tracking when a route component mounts.
 * - Pause tracking when the document becomes hidden (tab switch).
 * - Stop tracking on component unmount or page unload.
 */

import { useEffect } from 'react'
import { useLearningAnalyticsStore } from '../stores/learningAnalyticsStore'

let activeSubscribers = 0

/**
 * Tracks engagement time for a specific route.
 * Handles visibility changes (pausing/resuming) and cleanup automatically.
 *
 * @param route - The identifier for the current route/page (e.g., "Lesson 1").
 */
export function useLearningAnalytics(route: string): void {
  useEffect(() => {
    useLearningAnalyticsStore.getState().hydrate()
    useLearningAnalyticsStore.getState().startTrackingRoute(route)
  }, [route])

  useEffect(() => {
    activeSubscribers += 1

    const onVisibilityChange = () => {
      const store = useLearningAnalyticsStore.getState()
      if (document.hidden) {
        store.pauseTracking()
      } else {
        store.resumeTracking()
      }
    }

    const onBeforeUnload = () => {
      useLearningAnalyticsStore.getState().stopTracking()
    }

    if (activeSubscribers === 1 && typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange)
      window.addEventListener('beforeunload', onBeforeUnload)
    }

    return () => {
      activeSubscribers = Math.max(0, activeSubscribers - 1)
      useLearningAnalyticsStore.getState().stopTracking()

      if (activeSubscribers === 0 && typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange)
        window.removeEventListener('beforeunload', onBeforeUnload)
      }
    }
  }, [])
}
