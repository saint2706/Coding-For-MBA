import fs from 'fs';

const render = fs.readFileSync('src/components/MarkdownRenderer.tsx', 'utf8');
const renderLines = render.split('\n');
console.log(renderLines.slice(400, 440).join('\n'));
