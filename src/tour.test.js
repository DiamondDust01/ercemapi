import test from 'node:test';
import assert from 'node:assert/strict';
import { placeBalloon, findTourTarget } from './tour.js';

const viewport = { width: 1000, height: 800 };
const balloon = { width: 300, height: 160 };

test('balão fica abaixo do elemento quando cabe, com a seta apontando para ele', () => {
  const place = placeBalloon({ target: { top: 20, left: 900, width: 40, height: 40 }, balloon, viewport });
  assert.equal(place.top, 72);
  assert.equal(place.left, 1000 - 300 - 12); // preso dentro da tela
  assert.equal(place.arrow.side, 'top');
  assert.equal(place.arrow.offset, 920 - place.left);
});

test('balão sobe quando não há espaço embaixo', () => {
  const place = placeBalloon({ target: { top: 700, left: 100, width: 200, height: 60 }, balloon, viewport });
  assert.equal(place.arrow.side, 'bottom');
  assert.equal(place.top, 700 - 12 - 160);
  assert.equal(place.left, 50);
});

test('elemento enorme: balão encosta embaixo, sem seta', () => {
  const place = placeBalloon({ target: { top: 10, left: 10, width: 980, height: 760 }, balloon, viewport });
  assert.equal(place.arrow, null);
  assert.equal(place.top, 800 - 160 - 12);
});

test('sem elemento, balão fica no centro', () => {
  const place = placeBalloon({ target: null, balloon, viewport });
  assert.deepEqual(place, { top: 320, left: 350, arrow: null });
});

test('celular estreito: o balão nunca sai da tela', () => {
  const narrow = { width: 375, height: 812 };
  const place = placeBalloon({ target: { top: 760, left: 0, width: 75, height: 56 }, balloon: { width: 351, height: 170 }, viewport: narrow });
  assert.ok(place.left >= 12 && place.left + 351 <= 375 - 12 + 0.001);
  assert.ok(place.arrow.offset >= 18);
});

test('findTourTarget pula elementos escondidos e aceita lista de seletores', () => {
  const hidden = { getBoundingClientRect: () => ({ width: 0, height: 0 }) };
  const shown = { getBoundingClientRect: () => ({ width: 10, height: 10 }) };
  const root = { querySelectorAll: (selector) => (selector === '#a' ? [hidden] : selector === '#b' ? [hidden, shown] : []) };
  assert.equal(findTourTarget(['#a', '#b'], root), shown);
  assert.equal(findTourTarget('#a', root), null);
  assert.equal(findTourTarget('#c', root), null);
});
