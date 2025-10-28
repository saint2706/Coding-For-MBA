# Learner Progress Backend

A lightweight FastAPI application for tracking learner progress, managing badges, and generating certificates.

## Features

- **Progress Tracking**: Record lesson completion and quiz scores
- **Badge System**: Automatic badge awards for phase completion
- **Certificate Generation**: Generate PDF certificates for completed phases
- **Adaptive Suggestions**: Smart next-lesson recommendations based on progress
- **Cookie-only Mode**: Privacy-first anonymous tracking (no registration required)
- **Optional OAuth**: GitHub authentication for persistent accounts

## Quick Start

### Running Locally

```bash
# From repository root
cd learner_backend

# Install dependencies (from repo root)
pip install -r requirements-dev.txt

# Run the server
python -m learner_backend.main

# Or with uvicorn directly
uvicorn learner_backend.main:app --reload
```

The server will start at `http://127.0.0.1:8000`

### Accessing the Dashboard

Open your browser to:
- Dashboard: `http://127.0.0.1:8000/static/dashboard.html`
- API docs: `http://127.0.0.1:8000/docs`
- API root: `http://127.0.0.1:8000/`

## Configuration

### Environment Variables

Create a `.env` file in the `learner_backend/` directory:

```bash
# Optional: GitHub OAuth (leave blank for cookie-only mode)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Optional: JWT secret (auto-generated if not provided)
SECRET_KEY=your_secret_key_here

# Optional: Database path (default: learner.db in current directory)
DATABASE_URL=learner.db
```

### Cookie-Only Mode (Default)

If `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are not set, the backend operates in cookie-only mode:
- No user registration or login required
- Anonymous user ID stored in browser cookie
- Progress persists in local SQLite database
- Perfect for self-hosted or single-user deployments

### GitHub OAuth Mode

To enable GitHub OAuth:

1. Create a GitHub OAuth App:
   - Go to Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Set Homepage URL: `http://127.0.0.1:8000`
   - Set Authorization callback URL: `http://127.0.0.1:8000/api/v1/auth/github`
   
2. Copy Client ID and Client Secret to `.env` file

3. Restart the server

## API Endpoints

### Progress Management

**Record Progress**
```bash
POST /api/v1/progress
Content-Type: application/json

{
  "user_id": "user_123",
  "day": 1,
  "status": "completed",
  "quiz_score": 85
}
```

**Get User Progress**
```bash
GET /api/v1/progress/{user_id}

Response:
{
  "user_id": "user_123",
  "total_lessons": 10,
  "completed": 8,
  "in_progress": 2,
  "completion_percentage": 7.4,
  "lessons": [...]
}
```

### Badges

**Get User Badges**
```bash
GET /api/v1/badges/{user_id}

Response:
{
  "user_id": "user_123",
  "badge_count": 2,
  "badges": [
    {
      "badge_id": "badge_abc123",
      "phase": 1,
      "earned_at": "2024-01-15T10:30:00"
    }
  ]
}
```

### Certificates

**Request Certificate**
```bash
POST /api/v1/certificates
Content-Type: application/json

{
  "user_id": "user_123",
  "name": "John Doe",
  "phase": 1
}

Response:
{
  "success": true,
  "certificate_url": "/certificates/user_123_phase_1.pdf"
}
```

### Adaptive Path

**Get Next Lesson Suggestion**
```bash
GET /api/v1/adaptive/suggest?user_id=user_123

Response:
{
  "suggested_lesson": 15,
  "reason": "Continue with Day 15",
  "recommendation": "You're making great progress!"
}
```

## Database Schema

### Users Table
- `user_id` (TEXT, PRIMARY KEY): Unique user identifier
- `username` (TEXT): Optional username (GitHub username if OAuth)
- `created_at` (TEXT): Account creation timestamp
- `last_active` (TEXT): Last activity timestamp

### Progress Table
- `id` (INTEGER, PRIMARY KEY): Auto-increment ID
- `user_id` (TEXT): User reference
- `day` (INTEGER): Lesson day number (1-108)
- `status` (TEXT): 'started', 'in_progress', 'completed'
- `quiz_score` (INTEGER): Optional quiz score (0-100)
- `updated_at` (TEXT): Last update timestamp

### Badges Table
- `badge_id` (TEXT, PRIMARY KEY): Unique badge identifier
- `user_id` (TEXT): User reference
- `phase` (INTEGER): Phase number (1-7)
- `earned_at` (TEXT): Badge earned timestamp

## Deployment Options

### Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set SECRET_KEY=your_secret_key
heroku config:set GITHUB_CLIENT_ID=your_client_id
heroku config:set GITHUB_CLIENT_SECRET=your_client_secret

# Deploy
git push heroku main

# Open app
heroku open
```

### Fly.io

```bash
# Install flyctl
fly auth login

# Initialize app
fly launch

# Set secrets
fly secrets set SECRET_KEY=your_secret_key
fly secrets set GITHUB_CLIENT_ID=your_client_id
fly secrets set GITHUB_CLIENT_SECRET=your_client_secret

# Deploy
fly deploy
```

### Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements-dev.txt`
4. Set start command: `uvicorn learner_backend.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard
6. Deploy

### Docker

```dockerfile
FROM python:3.13-slim

WORKDIR /app

COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt

COPY learner_backend/ learner_backend/

CMD ["uvicorn", "learner_backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build
docker build -t learner-backend .

# Run
docker run -p 8000:8000 -e SECRET_KEY=your_secret learner-backend
```

## Development

### Running Tests

```bash
# From repo root
pytest tests/
```

### Database Migrations

The database schema is auto-created on first run. To reset:

```bash
rm learner.db
python -m learner_backend.main
```

For production, consider using Alembic for migrations:

```bash
pip install alembic
alembic init migrations
# Edit alembic.ini and migrations/env.py
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

## Security Considerations

### Production Checklist

- [ ] Set strong `SECRET_KEY` (use `secrets.token_urlsafe(32)`)
- [ ] Use HTTPS in production (never HTTP for OAuth)
- [ ] Configure CORS to allow only your domain
- [ ] Use PostgreSQL instead of SQLite for multi-user deployments
- [ ] Enable rate limiting (e.g., with `slowapi`)
- [ ] Set secure cookie flags: `secure=True`, `httponly=True`, `samesite='strict'`
- [ ] Regularly backup database
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated

### Data Privacy

- Cookie-only mode: No personal data leaves the browser
- OAuth mode: Only GitHub username is stored
- Quiz scores: Stored locally, never shared
- No tracking pixels or third-party analytics
- GDPR compliant: Users can export/delete their data

## Troubleshooting

### Server won't start

Check that port 8000 is available:
```bash
lsof -i :8000  # Find process using port
kill -9 <PID>  # Kill if needed
```

### Database locked error

SQLite doesn't handle high concurrency well. For production:
- Use PostgreSQL: `pip install psycopg2-binary asyncpg`
- Update `DATABASE_URL` to PostgreSQL connection string

### CORS errors

Update `allow_origins` in `main.py` to include your frontend domain:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    ...
)
```

## Support

For issues or questions:
- Check API documentation: `http://127.0.0.1:8000/docs`
- Review logs for error messages
- Open an issue on GitHub
- See main README.md for project details
