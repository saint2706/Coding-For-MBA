# Learner Progress Dashboard

Track your learning journey through the Coding for MBA curriculum with our built-in progress tracking system.

## Features

- **Progress Tracking**: Monitor completion of all 108 lessons
- **Badge System**: Earn badges for completing each of the 7 phases
- **Quiz Scores**: Track your quiz performance over time
- **Streaks**: Maintain learning streaks for motivation
- **Certificates**: Generate PDF certificates for phase completion

## Quick Start

### Accessing the Dashboard

The dashboard is available at: `http://127.0.0.1:8000/static/dashboard.html`

### Starting the Backend

```bash
# From repository root
cd learner_backend
python -m learner_backend.main

# Or with uvicorn
uvicorn learner_backend.main:app --reload
```

The server starts at `http://127.0.0.1:8000`

## Using the Dashboard

### Tracking Progress

As you complete lessons, your progress is automatically tracked:

1. **Mark as Started**: Click "Start" on any lesson
1. **Mark as Completed**: Complete the lesson and click "Complete"
1. **Take Quizzes**: Quiz scores are recorded automatically
1. **View Progress**: Check your dashboard for overall stats

### Earning Badges

Badges are awarded automatically when you complete all lessons in a phase:

- **Phase 1**: Python Foundations (Days 1-20)
- **Phase 2**: Data Workflows (Days 21-39)
- **Phase 3**: ML Fundamentals (Days 40-54)
- **Phase 4**: Advanced ML & MLOps (Days 55-67)
- **Phase 5**: Business Intelligence (Days 68-84)
- **Phase 6**: Advanced BI & Capstone (Days 85-90)
- **Phase 7**: SQL & Database Mastery (Days 91-108)

### Generating Certificates

Once you complete a phase, generate a certificate:

```bash
python scripts/generate_certificate.py --name "Your Name" --phase 1
```

Certificates are saved to `artifacts/certs/`

## Authentication Modes

### Cookie-Only Mode (Default)

- No registration required
- Anonymous user ID stored in browser cookie
- Progress persists locally
- Perfect for self-study

### GitHub OAuth Mode

Enable GitHub authentication by setting environment variables:

```bash
export GITHUB_CLIENT_ID=your_client_id
export GITHUB_CLIENT_SECRET=your_client_secret
```

Benefits:

- Persistent progress across devices
- Optional: Share progress with mentors/instructors
- Required for team/class deployments

## API Integration

### Recording Progress Manually

```javascript
// Mark lesson as completed
fetch('/api/v1/progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'current',
    day: 5,
    status: 'completed',
    quiz_score: 85
  })
});
```

### Getting Progress Data

```javascript
// Fetch user progress
fetch('/api/v1/progress/user_123')
  .then(res => res.json())
  .then(data => {
    console.log('Completion:', data.completion_percentage);
    console.log('Badges:', data.badge_count);
  });
```

## Self-Hosting

### Local Deployment

Perfect for individual learners:

```bash
# Run locally
python -m learner_backend.main
```

Access at `http://localhost:8000`

### Production Deployment

See the learner backend documentation for deployment guides:

- Heroku
- Fly.io
- Render
- Docker

### Database Options

**SQLite (Default)**: Great for single-user or small deployments

**PostgreSQL (Recommended for production)**:

```bash
export DATABASE_URL="postgresql://user:password@localhost/dbname"
```

## Privacy & Data

### What's Stored

- User ID (anonymous or GitHub username)
- Lesson progress (started/completed status)
- Quiz scores
- Badge achievements
- Timestamps

### What's NOT Stored

- Personal information (beyond optional GitHub username)
- IP addresses
- Browser fingerprints
- Cross-site tracking data

### Data Export

Export your progress data:

```bash
# Via API
curl http://localhost:8000/api/v1/progress/user_123 > my_progress.json
```

### Data Deletion

Delete all your data:

1. **Cookie-only mode**: Clear browser cookies
1. **OAuth mode**: Contact administrator or delete via API

## Troubleshooting

### Dashboard shows "Failed to load progress"

1. Ensure backend is running: `python -m learner_backend.main`
1. Check console for error messages (F12 in browser)
1. Verify database exists: `ls learner_backend/learner.db`

### Progress not saving

1. Check browser console for API errors
1. Verify endpoint: `http://localhost:8000/api/v1/progress`
1. Ensure cookies are enabled

### OAuth not working

1. Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
1. Check OAuth callback URL: `http://localhost:8000/api/v1/auth/github`
1. Review GitHub OAuth app settings

## Advanced Features

### Adaptive Learning Path

Get personalized lesson recommendations:

```bash
curl http://localhost:8000/api/v1/adaptive/suggest?user_id=user_123
```

Returns next suggested lesson based on:

- Current progress
- Quiz performance
- Learning pace

### Custom Integrations

Integrate with:

- **LMS systems** (Canvas, Moodle)
- **Slack bots** for streak reminders
- **GitHub Actions** for automated progress updates
- **Discord bots** for community challenges

## Support

For help:

- Review API docs: `http://localhost:8000/docs`
- Check the learner backend documentation in the repository
- Open an issue on [GitHub](https://github.com/saint2706/Coding-For-MBA/issues)
- Ask in [GitHub Discussions](https://github.com/saint2706/Coding-For-MBA/discussions)

## Roadmap

Upcoming features:

- [ ] Team leaderboards
- [ ] Custom learning paths
- [ ] Mentor assignment
- [ ] Progress sharing
- [ ] Mobile app
