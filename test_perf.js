import { readFileSync } from 'fs';

const filePaths = [
  'src/pages/Home.tsx',
  'src/pages/ProgressDashboard.tsx',
  'src/pages/Curriculum.tsx',
  'src/pages/PhaseOverview.tsx',
  'src/components/Sidebar.tsx',
  'src/components/MarkdownRenderer.tsx'
];

filePaths.forEach(path => {
    try {
        const content = readFileSync(path, 'utf8');
        const length = content.length;
        console.log(`${path}: ${length} chars`);
    } catch (e) {
        console.error(`Error reading ${path}`);
    }
});
