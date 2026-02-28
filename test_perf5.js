import fs from 'fs';

const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const sidebarLines = sidebar.split('\n');
console.log(sidebarLines.slice(40, 70).join('\n'));
