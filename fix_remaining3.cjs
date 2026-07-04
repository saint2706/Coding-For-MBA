const fs = require('fs')

function updatePhaseOverview() {
  const file = 'src/pages/PhaseOverview.tsx'
  let content = fs.readFileSync(file, 'utf8')

  if (!content.includes('createRoutePrefetchHandlers')) {
    content = content.replace(
      "import { useParams, Link } from 'react-router-dom'",
      "import { useParams, Link } from 'react-router-dom'\nimport { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'"
    )
  }

  content = content.replace(
    '<Link to={`/solutions/${phaseNum}`} className="phase-notebooks-link">',
    '<Link to={`/solutions/${phaseNum}`} className="phase-notebooks-link" {...createRoutePrefetchHandlers(`/solutions/${phaseNum}`)}>'
  )

  content = content.replace(
    '<Link\n                    to={`/lesson/${lesson.day}`}\n                    className={`phase-day-link ${isCompleted ? \'phase-day-link--done\' : \'\'}`}\n                  >',
    '<Link\n                    to={`/lesson/${lesson.day}`}\n                    className={`phase-day-link ${isCompleted ? \'phase-day-link--done\' : \'\'}`}\n                    {...createRoutePrefetchHandlers(`/lesson/${lesson.day}`)}\n                  >'
  )

  fs.writeFileSync(file, content)
}
updatePhaseOverview()
console.log('done')
