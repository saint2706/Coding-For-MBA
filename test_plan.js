import fs from 'fs';

const content = fs.readFileSync('src/pages/ProgressDashboard.tsx', 'utf8');
console.log(content.includes('useMemo(() => getStreakDays(), [completedLessons.length])'));
