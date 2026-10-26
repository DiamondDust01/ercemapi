import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  readStoredTheme, writeStoredTheme, normalizeTheme, oppositeTheme, applyTheme, THEME_KEY, DEFAULT_THEME
} from './theme.js';
import { readPalette, buildLightTheme, lightSourceFor, LIGHT_SURFACE } from '../scripts/generate-light-theme.mjs';

const memoryStorage = () => {
  const map = new Map();
  return { getItem: (key) => (map.has(key) ? map.get(key) : null), setItem: (key, value) => map.set(key, String(value)), map };
};

test('tema padrão é o escuro e valores inválidos voltam ao padrão', () => {
  assert.equal(DEFAULT_THEME, 'dark');
  assert.equal(readStoredTheme(memoryStorage()), 'dark');
  assert.equal(normalizeTheme('sépia'), 'dark');
  assert.equal(readStoredTheme({ getItem: () => { throw new Error('bloqueado'); } }), 'dark');
});

test('guarda a escolha do aparelho e alterna entre claro e escuro', () => {
  const storage = memoryStorage();
  writeStoredTheme('light', storage);
  assert.equal(storage.map.get(THEME_KEY), 'light');
  assert.equal(readStoredTheme(storage), 'light');
  assert.equal(oppositeTheme('light'), 'dark');
  assert.equal(oppositeTheme('dark'), 'light');
  const root = { dataset: {} };
  applyTheme('light', root);
  assert.equal(root.dataset.theme, 'light');
});

test('tema claro: cartões brancos, texto escuro e botões saturados', () => {
  assert.equal(lightSourceFor('slate', 900), LIGHT_SURFACE);
  assert.equal(lightSourceFor('slate', 300), 700);
  assert.equal(lightSourceFor('indigo', 300), 700);
  assert.equal(lightSourceFor('indigo', 600), 600);
  assert.equal(lightSourceFor('cyan', 900), 100);
  const scale = (hue) => Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => [`--color-${hue}-${shade}`, `${hue}${shade}`]));
  const css = buildLightTheme(readPalette(Object.entries({ ...scale('slate'), ...scale('indigo') }).map(([key, value]) => `${key}: ${value};`).join(' ')));
  assert.match(css, /--color-slate-900: #ffffff;/);
  assert.match(css, /--color-slate-300: slate700;/);
  assert.match(css, /--color-indigo-600: indigo600;/);
  assert.match(css, /--color-indigo-900: indigo100;/);
  assert.match(css, /.bg-indigo-600.text-white/);
  assert.doesNotMatch(css, /.bg-slate-600.text-white/);
});

test('o CSS versionado está em dia com o Tailwind instalado', () => {
  const installed = fs.readFileSync(new URL('../node_modules/tailwindcss/theme.css', import.meta.url), 'utf8');
  const committed = fs.readFileSync(new URL('./themeLight.css', import.meta.url), 'utf8');
  assert.equal(committed.replace(/\r\n/g, '\n'), buildLightTheme(readPalette(installed)), 'rode node scripts/generate-light-theme.mjs');
});
