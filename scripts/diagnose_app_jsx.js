const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../src/App.jsx'), 'utf8');
const lines = src.split(/\r?\n/);
console.log('Total lines:', lines.length);
for (let i = 0; i < lines.length; i += 50) {
  const start = i;
  const end = Math.min(lines.length, i + 50);
  console.log(`\nLines ${start + 1}-${end}:`);
  for (let j = start; j < end; j++) {
    const line = lines[j];
    if (j >= 1590 && j <= 1610) {
      console.log(`${j + 1}: ${JSON.stringify(line)}`);
    }
  }
}
const openers = ['(', '{', '['];
const closers = [')', '}', ']'];
const pair = {
  '(': ')',
  '{': '}',
  '[': ']',
};
const stack = [];
for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
  const line = lines[lineIndex];
  for (let col = 0; col < line.length; col++) {
    const ch = line[col];
    if (openers.includes(ch)) {
      stack.push({ ch, line: lineIndex + 1, col: col + 1 });
    }
    if (closers.includes(ch)) {
      const last = stack[stack.length - 1];
      if (!last || pair[last.ch] !== ch) {
        console.log('Mismatch at line', lineIndex + 1, 'col', col + 1, 'found', ch, 'expected', last ? pair[last.ch] : 'none');
        process.exit(1);
      }
      stack.pop();
    }
  }
}
if (stack.length) {
  console.log('Unclosed tokens:', stack.slice(-5));
} else {
  console.log('Brackets balanced');
}
