import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const text = readFileSync(join(process.cwd(), 'src', 'App.jsx'), 'utf8');
const lines = text.split(/\r?\n/);
let balance = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const openCount = (line.match(/\{/g) || []).length;
  const closeCount = (line.match(/\}/g) || []).length;
  balance += openCount - closeCount;
  if (openCount || closeCount) {
    if (balance > 0 && i > 560 && i < 1620) {
      console.log(`${String(i+1).padStart(4)}: +${openCount} -${closeCount} = ${balance} | ${line}`);
    }
  }
}
console.log('FINAL BALANCE', balance);
