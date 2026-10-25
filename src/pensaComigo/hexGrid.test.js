import test from 'node:test';
import assert from 'node:assert/strict';
import { hexCenters, hexHeight, hexPolygon, digitFor } from './hexGrid.js';

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('hexágonos vizinhos ficam a √3·lado de distância, sem sobreposição', () => {
  const side = 22;
  const centers = hexCenters(400, 300, side);
  const expected = hexHeight(side);
  centers.slice(0, 40).forEach((center) => {
    const nearest = Math.min(...centers.filter((other) => other !== center).map((other) => distance(center, other)));
    assert.ok(Math.abs(nearest - expected) < 1e-9, `vizinho mais próximo a ${nearest}`);
  });
});

test('a malha cobre a área inteira', () => {
  const side = 22;
  const centers = hexCenters(360, 760, side);
  const maxX = Math.max(...centers.map((center) => center.x));
  const maxY = Math.max(...centers.map((center) => center.y));
  assert.ok(maxX + side >= 360);
  assert.ok(maxY + hexHeight(side) / 2 >= 760);
});

test('cada dígito fica dentro do próprio hexágono', () => {
  const side = 22;
  hexCenters(200, 200, side).forEach((center) => {
    const points = hexPolygon(center.x, center.y, side).split(' ').map((pair) => pair.split(',').map(Number));
    const cx = points.reduce((sum, [x]) => sum + x, 0) / 6;
    const cy = points.reduce((sum, [, y]) => sum + y, 0) / 6;
    assert.ok(Math.abs(cx - center.x) < 0.01 && Math.abs(cy - center.y) < 0.01);
  });
  assert.equal(digitFor({ column: 0, row: 0 }), '0');
  assert.equal(digitFor({ column: 1, row: 0 }), '1');
});
