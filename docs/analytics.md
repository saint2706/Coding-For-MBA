# Analytics & Privacy

## Overview

The Coding for MBA platform includes **optional**, privacy-first analytics to help understand which lessons are most valuable and where learners might need additional support.

## Privacy Principles

### 🔒 Privacy-First Design

1. **Opt-in only**: Analytics are **disabled by default**
1. **No personal data**: We never collect names, emails, IP addresses, or other PII
1. **No tracking cookies**: Only session-based, anonymous tracking
1. **No third-party trackers**: No Google Analytics, Facebook Pixel, or similar
1. **Local-first**: Data stored locally when possible

### 📊 What We Collect (When Enabled)

Only anonymized, aggregated data:

- **Page views**: Which lessons are viewed (no user identity)
- **Quiz results**: Anonymous quiz scores to improve content
- **Session data**: Temporary session IDs (reset on browser close)
- **Timestamps**: When lessons are accessed (for peak usage analysis)

### 🚫 What We Never Collect

- Personal information (name, email, phone)
- IP addresses or geolocation
- Browser fingerprints
- Cross-site tracking data
- Individual user identities

## Enabling Analytics

Analytics are disabled by default. To enable:

### For Site Administrators

Add to `mkdocs.yml`:

```yaml
extra_javascript:
  - analytics/logger.js
  - javascripts/init-analytics.js

extra:
  analytics:
    enabled: true
    endpoint: '/api/v1/analytics/event'  # Or Plausible URL
```

### For Self-Hosted Deployments

1. **Option A: Use Learner Backend** (recommended)

   - Events stored in local SQLite database
   - Generate reports with `analytics/report.py`
   - Full control over data

1. **Option B: Use Plausible Analytics** (privacy-friendly)

   - Self-hosted or cloud-hosted Plausible
   - GDPR-compliant analytics
   - No cookies, respects Do Not Track

## Generating Reports

```bash
# Generate analytics report from learner backend
python analytics/report.py --input learner_backend/learner.db --output reports/

# View report
open reports/index.html
```

Report includes:

- Lesson popularity (page views)
- Quiz performance (average scores, pass rates)
- Traffic patterns (peak usage times)

## GDPR Compliance

### Data Subject Rights

Users have the right to:

1. **Access**: Request their data (stored locally, accessible via browser)
1. **Delete**: Clear cookies and local storage
1. **Port**: Export their progress data
1. **Opt-out**: Disable analytics at any time

### Implementation

```javascript
// Users can opt-out anytime
localStorage.setItem('analytics_opt_out', 'true');

// Clear all local data
localStorage.clear();
sessionStorage.clear();
```

### Cookie Policy

If you enable analytics, update your site's cookie policy to include:

> "We use session-only analytics cookies to understand how learners use this platform. These cookies do not track you across websites and are deleted when you close your browser. You can opt-out anytime in Settings."

## For Maintainers

### Database Schema

If using the learner backend, events are stored in:

```sql
CREATE TABLE analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    data TEXT,  -- JSON
    session_id TEXT,  -- Anonymous, temporary
    timestamp TEXT NOT NULL
);
```

### Extending Analytics

Add new event types in `analytics/logger.js`:

```javascript
// Example: Track lesson completion
AnalyticsLogger.logEvent('lesson_completed', {
    lesson: 'Day_05',
    phase: 1,
    duration: 1800  // seconds
});
```

## Alternative Solutions

### Plausible Analytics (Recommended)

Privacy-friendly, GDPR-compliant analytics:

```html
<!-- Add to docs/overrides/main.html -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

Benefits:

- No cookies
- Respects Do Not Track
- Open source
- Can self-host

### Matomo (Self-Hosted)

Full-featured, self-hosted analytics:

- Install Matomo on your server
- Configure to respect privacy settings
- Enable IP anonymization

### No Analytics

Running without any analytics is perfectly fine! The platform works fully offline and locally without any data collection.

## Questions?

For questions about privacy or analytics:

- Open an issue on [GitHub](https://github.com/saint2706/Coding-For-MBA/issues)
- Contact the maintainers

**Remember**: Analytics are a tool to improve the platform, not a requirement. Your privacy comes first.
