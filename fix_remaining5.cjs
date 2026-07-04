const fs = require('fs')

function updatePhaseOverview2() {
  const file = 'src/pages/PhaseOverview.tsx'
  let content = fs.readFileSync(file, 'utf8')

  // Actually, PhaseOverview might already have those handlers or something failed in replacement.
  content = content.replace(
    'import { createRoutePrefetchHandlers } from \'../utils/prefetchRoutes\'\n',
    ''
  )

  fs.writeFileSync(file, content)
}
updatePhaseOverview2()
console.log('done')
