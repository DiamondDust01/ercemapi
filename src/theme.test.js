import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  readStoredTheme, writeStoredTheme, normalizeTheme, oppositeTheme, applyTheme, THEME_KEY, DEFAULT_THEME
} from './theme.js';
import { readPalette, buildLightTheme, mirrorShade } from '../scripts/generate-light-theme.mjs';

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

test('tema claro espelha as escalas do Tailwind', () => {
  assert.equal(mirrorShade(50), 950);
  assert.equal(mirrorShade(300), 700);
  assert.equal(mirrorShade(500), 500);
  const palette = readPalette('--color-slate-50: A; --color-slate-100: B; --color-slate-200: C; --color-slate-300: D; --color-slate-400: E; --color-slate-500: F; --color-slate-600: G; --color-slate-700: H; --color-slate-800: I; --color-slate-900: J; --color-slate-950: K;');
  const css = buildLightTheme(palette);
  assert.match(css, /--color-slate-50: K;/);
  assert.match(css, /--color-slate-950: A;/);
  assert.match(css, /--color-slate-500: F;/);
});

test('o CSS versionado está em dia com o Tailwind instalado', () => {
  const installed = fs.readFileSync(new URL('../node_modules/tailwindcss/theme.css', import.meta.url), 'utf8');
  const committed = fs.readFileSync(new URL('./themeLight.css', import.meta.url), 'utf8');
  assert.equal(committed.replace(/\r\n/g, '\n'), buildLightTheme(readPalette(installed)), 'rode node scripts/generate-light-theme.mjs');
});
