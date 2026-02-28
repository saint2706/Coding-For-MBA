import fs from 'fs';

const lesson = fs.readFileSync('src/pages/Lesson.tsx', 'utf8');
const lessonLines = lesson.split('\n');
console.log(lessonLines.slice(60, 100).join('\n'));
