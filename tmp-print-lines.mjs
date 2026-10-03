import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const text = readFileSync(join(process.cwd(), 'src', 'App.jsx'), 'utf8');
const lines = text.split(/\r?\n/);
const start = 520;
const end = 580;
for (let i = start - 1; i < end && i < lines.length; i++) {
  console.log(`${String(i + 1).padStart(4)}: ${lines[i]}`);
}
