const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// The `useLocation` import is already present.
// I just need to determine `isLesson` inside App.

content = content.replace(
  `useLearningAnalytics(location.pathname)`,
  `useLearningAnalytics(location.pathname)

  const isLesson = location.pathname.startsWith('/lesson/')`
);

content = content.replace(
  `<ScrollProgress />`,
  `<ScrollProgress isLesson={isLesson} targetSelector={isLesson ? 'article' : undefined} />`
);

fs.writeFileSync(file, content);
console.log('patched');
