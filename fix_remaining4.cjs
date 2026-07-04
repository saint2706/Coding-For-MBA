const fs = require('fs')

function updateLesson() {
  const file = 'src/pages/Lesson.tsx'
  let content = fs.readFileSync(file, 'utf8')

  if (!content.includes('createRoutePrefetchHandlers')) {
    content = content.replace(
      "import { useParams, Link, useNavigate } from 'react-router-dom'",
      "import { useParams, Link, useNavigate } from 'react-router-dom'\nimport { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'"
    )
  }

  content = content.replace(
    '<Link to={`/lesson/${prev.day}`} className="lesson-nav-btn prev">',
    '<Link to={`/lesson/${prev.day}`} className="lesson-nav-btn prev" {...createRoutePrefetchHandlers(`/lesson/${prev.day}`)}>'
  )

  content = content.replace(
    '<Link to={`/lesson/${next.day}`} className="lesson-nav-btn next">',
    '<Link to={`/lesson/${next.day}`} className="lesson-nav-btn next" {...createRoutePrefetchHandlers(`/lesson/${next.day}`)}>'
  )

  fs.writeFileSync(file, content)
}
updateLesson()
console.log('done')
