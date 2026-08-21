const fs = require('fs');
const file = './src/components/MermaidDiagram.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("node.tagName === 'A'", "node.tagName.toUpperCase() === 'A'");
fs.writeFileSync(file, content);
console.log('Fixed SVG case sensitivity in DOMPurify hook.');
