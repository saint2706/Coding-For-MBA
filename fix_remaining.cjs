const fs = require('fs')

function updateCurriculum() {
  const file = 'src/pages/Curriculum.tsx'
  let content = fs.readFileSync(file, 'utf8')

  if (!content.includes('createRoutePrefetchHandlers')) {
    content = content.replace(
      "import { Link } from 'react-router-dom'",
      "import { Link } from 'react-router-dom'\nimport { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'"
    )
  }

  content = content.replace(
    '<Link to={`/phase/${phase.phase}`} className="curriculum-phase-header">',
    '<Link to={`/phase/${phase.phase}`} className="curriculum-phase-header" {...createRoutePrefetchHandlers(`/phase/${phase.phase}`)}>'
  )

  content = content.replace(
    '<Link\n                      to={`/lesson/${lesson.day}`}\n                      className={`curriculum-day-link ${isDone ? \'curriculum-day-link--done\' : \'\'}`}\n                    >',
    '<Link\n                      to={`/lesson/${lesson.day}`}\n                      className={`curriculum-day-link ${isDone ? \'curriculum-day-link--done\' : \'\'}`}\n                      {...createRoutePrefetchHandlers(`/lesson/${lesson.day}`)}\n                    >'
  )
  fs.writeFileSync(file, content)
}
updateCurriculum()
console.log('done')
