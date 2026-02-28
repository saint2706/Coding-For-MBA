import fs from 'fs';

const sidebarGroup = fs.readFileSync('src/components/SidebarPhaseGroup.tsx', 'utf8');
const sidebarGroupLines = sidebarGroup.split('\n');
console.log(sidebarGroupLines.slice(20, 50).join('\n'));
