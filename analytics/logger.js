/**
 * Privacy-first Analytics Logger for Coding for MBA
 *
 * Minimal client-side event logging that respects user privacy.
 * No personal data is collected. All analytics are opt-in.
 *
 * Usage:
 *   AnalyticsLogger.logEvent('page_view', { lesson: 'Day_01' });
 *   AnalyticsLogger.logEvent('quiz_completed', { lesson: 'Day_02', score: 85 });
 */

const AnalyticsLogger = (function() {
    'use strict';

    // Check if analytics are enabled (must be explicitly enabled in config)
    const ANALYTICS_ENABLED = window.ENABLE_ANALYTICS || false;
    const API_ENDPOINT = window.ANALYTICS_ENDPOINT || '/api/v1/analytics/event';

    /**
     * Log an analytics event
     * @param {string} eventType - Type of event (page_view, quiz_completed, etc.)
     * @param {object} data - Event data (no PII)
     */
    function logEvent(eventType, data = {}) {
        if (!ANALYTICS_ENABLED) {
            return; // Analytics disabled, do nothing
        }

        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            data: sanitizeData(data),
            session_id: getSessionId(),
            // No user ID, IP, or other identifying information
        };

        // Send to backend or Plausible
        sendEvent(event);
    }

    /**
     * Remove any potentially identifying information
     */
    function sanitizeData(data) {
        const sanitized = {};
        const allowedKeys = ['lesson', 'phase', 'score', 'duration', 'status'];

        for (const key of allowedKeys) {
            if (data.hasOwnProperty(key)) {
                sanitized[key] = data[key];
            }
        }

        return sanitized;
    }

    /**
     * Get or create a session ID (temporary, per-session only)
     */
    function getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id');

        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('analytics_session_id', sessionId);
        }

        return sessionId;
    }

    /**
     * Send event to backend
     */
    function sendEvent(event) {
        // Use navigator.sendBeacon for reliability (works even when page is closing)
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
            navigator.sendBeacon(API_ENDPOINT, blob);
        } else {
            // Fallback to fetch
            fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event),
                keepalive: true
            }).catch(err => console.warn('Analytics event failed:', err));
        }
    }

    /**
     * Log page view automatically
     */
    function autoLogPageView() {
        const lessonMatch = window.location.pathname.match(/Day_(\d+)/);
        if (lessonMatch) {
            logEvent('page_view', {
                lesson: lessonMatch[0],
                phase: getPhaseFromDay(parseInt(lessonMatch[1]))
            });
        }
    }

    /**
     * Get phase number from day number
     */
    function getPhaseFromDay(day) {
        if (day <= 20) return 1;
        if (day <= 39) return 2;
        if (day <= 54) return 3;
        if (day <= 67) return 4;
        if (day <= 84) return 5;
        if (day <= 90) return 6;
        if (day <= 108) return 7;
        return 0;
    }

    // Auto-log page views on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoLogPageView);
    } else {
        autoLogPageView();
    }

    // Public API
    return {
        logEvent: logEvent,
        enabled: ANALYTICS_ENABLED
    };
})();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsLogger;
}
