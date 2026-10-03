import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const text = readFileSync(join(process.cwd(), 'src', 'App.jsx'), 'utf8');
const lines = text.split(/\r?\n/);
const stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === '{') {
      stack.push({ line: i + 1, col: j + 1, text: line.trim() });
    } else if (ch === '}') {
      if (stack.length === 0) {
        console.log('Extra closing brace at', i + 1, j + 1, line.trim());
        process.exit(1);
      }
      stack.pop();
    }
  }
}
if (stack.length) {
  console.log('Unclosed brace count', stack.length);
  console.log('Top unclosed brace at line', stack[stack.length - 1].line, 'col', stack[stack.length - 1].col);
  console.log('Line text:', stack[stack.length - 1].text);
  if (stack.length > 1) {
    console.log('Earlier openings:');
    stack.slice(-5).forEach(entry => console.log(entry.line, entry.col, entry.text));
  }
} else {
  console.log('All braces matched');
}
