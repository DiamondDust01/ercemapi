import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const text = readFileSync(join(process.cwd(), 'src', 'App.jsx'), 'utf8');
const pairs = {'(': ')', '{': '}', '[': ']'};
const opens = new Set(Object.keys(pairs));
const closes = Object.fromEntries(Object.entries(pairs).map(([k,v]) => [v,k]));
const stack = [];
for (let i = 0; i < text.length; i++) {
  const ch = text[i];
  if (opens.has(ch)) {
    stack.push({ch, i});
  } else if (closes[ch]) {
    if (!stack.length || stack[stack.length - 1].ch !== closes[ch]) {
      const top = stack[stack.length - 1];
      console.log('Mismatch at index', i, 'char', ch, 'stackTop', top);
      process.exit(1);
    }
    stack.pop();
  }
}
if (stack.length) {
  const top = stack[stack.length - 1];
  console.log('Unclosed at EOF', top, 'remaining', stack.length);
  process.exit(1);
}
console.log('All balanced');
