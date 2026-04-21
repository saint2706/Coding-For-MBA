const fs = require('fs');

const content = fs.readFileSync('docs/todo.md', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
    if (line.includes('[') && line.includes('](')) {
        console.log(`Line ${index + 1}: ${line}`);
    }
});
