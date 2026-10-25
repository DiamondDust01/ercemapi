import test from 'node:test';
import assert from 'node:assert/strict';
import { gridDigitCenters, gridDigitFor } from './squareGrid.js';

test('cada dígito fica no centro de um quadrado da grade', () => {
  const cell = 24;
  gridDigitCenters(1357, 736, cell).forEach(({ x, y }) => {
    assert.equal(x % cell, cell / 2);
    assert.equal(y % cell, cell / 2);
  });
});

test('os dígitos cobrem a tela e alternam em xadrez', () => {
  const centers = gridDigitCenters(360, 760, 24);
  assert.ok(Math.max(...centers.map(({ x }) => x)) + 24 >= 360 - 24);
  assert.ok(Math.max(...centers.map(({ y }) => y)) + 24 >= 760 - 24);
  assert.equal(gridDigitFor({ column: 0, row: 0 }), '0');
  assert.equal(gridDigitFor({ column: 1, row: 0 }), '1');
  assert.equal(gridDigitFor({ column: 1, row: 1 }), '0');
});
