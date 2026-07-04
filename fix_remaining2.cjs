const fs = require('fs')

function updateProgressDashboard() {
  const file = 'src/pages/ProgressDashboard.tsx'
  let content = fs.readFileSync(file, 'utf8')

  if (!content.includes('createRoutePrefetchHandlers')) {
    content = content.replace(
      "import { Link } from 'react-router-dom'",
      "import { Link } from 'react-router-dom'\nimport { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'"
    )
  }

  content = content.replace(
    '<Link className="continue-banner-cta" to={`/lesson/${challengeLesson.day}`}>',
    '<Link className="continue-banner-cta" to={`/lesson/${challengeLesson.day}`} {...createRoutePrefetchHandlers(`/lesson/${challengeLesson.day}`)}>'
  )

  content = content.replace(
    '<Link to={`/lesson/${lesson.day}`} className="mastery-review-link">',
    '<Link to={`/lesson/${lesson.day}`} className="mastery-review-link" {...createRoutePrefetchHandlers(`/lesson/${lesson.day}`)}>'
  )

  fs.writeFileSync(file, content)
}
updateProgressDashboard()
console.log('done')
