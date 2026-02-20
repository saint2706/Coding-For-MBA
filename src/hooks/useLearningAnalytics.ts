import { useEffect } from 'react'
import { useLearningAnalyticsStore } from '../stores/learningAnalyticsStore'

let activeSubscribers = 0

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
