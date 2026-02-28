import fs from 'fs';

const render = fs.readFileSync('src/utils/searchIndex.ts', 'utf8');
const renderLines = render.split('\n');
console.log(renderLines.slice(150, 200).join('\n'));
