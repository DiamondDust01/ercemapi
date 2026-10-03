import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const text = readFileSync(join(process.cwd(), 'src', 'App.jsx'), 'utf8');
const lines = text.split(/\r?\n/);
let balance = 0;
const pairs = {'{':'}'};
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const openCount = (line.match(/\{/g) || []).length;
  const closeCount = (line.match(/\}/g) || []).length;
  balance += openCount - closeCount;
  if (i >= 1549) {
    console.log(`${String(i+1).padStart(4)}: +${openCount} -${closeCount} = ${balance} | ${line}`);
  }
}
console.log('FINAL', balance);
