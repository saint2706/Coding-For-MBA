const fs = require('fs')

function updateExercises() {
  const file = 'src/pages/Exercises.tsx'
  let content = fs.readFileSync(file, 'utf8')

  // Add import if not exists
  if (!content.includes('createRoutePrefetchHandlers')) {
    content = content.replace(
      "import { Link } from 'react-router-dom'",
      "import { Link } from 'react-router-dom'\nimport { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'"
    )
  }

  content = content.replace(
    '<Link key={p} to={`/solutions/${p}`} className="exercises-notebook-link">',
    '<Link key={p} to={`/solutions/${p}`} className="exercises-notebook-link" {...createRoutePrefetchHandlers(`/solutions/${p}`)}>'
  )

  fs.writeFileSync(file, content)
}

function updateHome() {
  const file = 'src/pages/Home.tsx'
  let content = fs.readFileSync(file, 'utf8')

  if (!content.includes('createRoutePrefetchHandlers')) {
    content = content.replace(
      "import { Link } from 'react-router-dom'",
      "import { Link } from 'react-router-dom'\nimport { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'"
    )
  }

  content = content.replace(
    '<Link to={`/phase/${phase.phase}`} className="phase-card-editorial" key={phase.phase}>',
    '<Link to={`/phase/${phase.phase}`} className="phase-card-editorial" key={phase.phase} {...createRoutePrefetchHandlers(`/phase/${phase.phase}`)}>'
  )

  content = content.replace(
    '<Link\n            to={lastVisitedLesson ? `/lesson/${lastVisitedLesson.day}` : \'/lesson/1\'}\n            className="action-primary"\n          >',
    '<Link\n            to={lastVisitedLesson ? `/lesson/${lastVisitedLesson.day}` : \'/lesson/1\'}\n            className="action-primary"\n            {...createRoutePrefetchHandlers(lastVisitedLesson ? `/lesson/${lastVisitedLesson.day}` : \'/lesson/1\')}\n          >'
  )

  content = content.replace(
    '<Link to="/curriculum" className="action-secondary">',
    '<Link to="/curriculum" className="action-secondary" {...createRoutePrefetchHandlers(\'/curriculum\')}>'
  )

  content = content.replace(
    '<Link to={`/lesson/${lastVisitedLesson.day}`} className="dashboard-tile-link">',
    '<Link to={`/lesson/${lastVisitedLesson.day}`} className="dashboard-tile-link" {...createRoutePrefetchHandlers(`/lesson/${lastVisitedLesson.day}`)}>'
  )

  fs.writeFileSync(file, content)
}

updateExercises()
updateHome()
console.log('updated')
