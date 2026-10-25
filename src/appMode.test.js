import test from 'node:test';
import assert from 'node:assert/strict';
import { readAppMode, writeAppMode, APP_MODE_KEY } from './appMode.js';

const memoryStorage = () => {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    map
  };
};

test('sem escolha salva, o app mostra a tela de seleção', () => {
  assert.equal(readAppMode(memoryStorage()), null);
  assert.equal(readAppMode(null), null);
});

test('guarda e lê a variação escolhida', () => {
  const storage = memoryStorage();
  writeAppMode('pensa', storage);
  assert.equal(readAppMode(storage), 'pensa');
  writeAppMode('obi', storage);
  assert.equal(readAppMode(storage), 'obi');
});

test('trocar de modo limpa a escolha e valores inválidos são ignorados', () => {
  const storage = memoryStorage();
  writeAppMode('pensa', storage);
  writeAppMode(null, storage);
  assert.equal(storage.map.has(APP_MODE_KEY), false);
  storage.setItem(APP_MODE_KEY, 'outro');
  assert.equal(readAppMode(storage), null);
});

test('falha de armazenamento não quebra o app', () => {
  const broken = { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('bloqueado'); } };
  assert.equal(readAppMode(broken), null);
  assert.equal(writeAppMode('obi', broken), false);
});
