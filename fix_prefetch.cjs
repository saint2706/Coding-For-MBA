const fs = require('fs')

function updateSidebar() {
  const file = 'src/components/Sidebar.tsx'
  let content = fs.readFileSync(file, 'utf8')

  // Add import if not exists
  if (!content.includes('createRoutePrefetchHandlers')) {
    content = content.replace(
      "import SidebarPhaseGroup from './SidebarPhaseGroup'",
      "import SidebarPhaseGroup from './SidebarPhaseGroup'\nimport { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'"
    )
  }

  content = content.replace(
    'aria-current={active ? \'page\' : undefined}',
    'aria-current={active ? \'page\' : undefined}\n      {...createRoutePrefetchHandlers(to)}'
  )

  content = content.replace(
    '<Link to="/" className="sidebar-brand" onClick={onClose}>',
    '<Link to="/" className="sidebar-brand" onClick={onClose} {...createRoutePrefetchHandlers(\'/\')}>'
  )

  fs.writeFileSync(file, content)
}

function updateSidebarPhaseGroup() {
  const file = 'src/components/SidebarPhaseGroup.tsx'
  let content = fs.readFileSync(file, 'utf8')

  if (!content.includes('createRoutePrefetchHandlers')) {
    content = content.replace(
      "import { dayTokenToProgressId } from '../utils/dayToken'",
      "import { dayTokenToProgressId } from '../utils/dayToken'\nimport { createRoutePrefetchHandlers } from '../utils/prefetchRoutes'"
    )
  }

  content = content.replace(
    'aria-current={currentPath === `/phase/${phase.phase}` ? \'page\' : undefined}',
    'aria-current={currentPath === `/phase/${phase.phase}` ? \'page\' : undefined}\n                {...createRoutePrefetchHandlers(`/phase/${phase.phase}`)}'
  )

  content = content.replace(
    'aria-current={currentPath === `/lesson/${lesson.day}` ? \'page\' : undefined}',
    'aria-current={currentPath === `/lesson/${lesson.day}` ? \'page\' : undefined}\n                  {...createRoutePrefetchHandlers(`/lesson/${lesson.day}`)}'
  )

  fs.writeFileSync(file, content)
}

updateSidebar()
updateSidebarPhaseGroup()
console.log('updated')
