import fs from 'fs';

const pDashboard = fs.readFileSync('src/pages/ProgressDashboard.tsx', 'utf8');
const pDashboardLines = pDashboard.split('\n');
console.log(pDashboardLines.slice(70, 100).join('\n'));
