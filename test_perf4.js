import fs from 'fs';

const home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
const homeLines = home.split('\n');
console.log(homeLines.slice(40, 70).join('\n'));
