import test from 'node:test';
import assert from 'node:assert/strict';
import { QUOTES, formatQuote } from './quotes.js';
import {
  layoutChunks, chunkLimit, createPhrase, advancePhrase, phraseCells, phraseDone, createRain, spawnPhrase,
  stepRain, seedRain, rainCells, DENSITY
} from './matrixRain.js';

const seeded = (seed) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 2 ** 32;
  };
};

test('frases: sem repetição, e citações trazem o autor', () => {
  const texts = QUOTES.map((quote) => quote.text);
  assert.equal(new Set(texts).size, texts.length);
  assert.ok(QUOTES.filter((quote) => quote.author).length >= 10);
  assert.equal(formatQuote({ text: 'Penso, logo existo.', author: 'René Descartes' }), 'Penso, logo existo. — René Descartes');
  assert.equal(formatQuote({ text: 'Pergunte por quê.' }), 'Pergunte por quê.');
});

test('a quebra em pedaços preserva o texto e não corta palavras', () => {
  QUOTES.forEach((quote) => {
    const text = formatQuote(quote);
    [12, 20, 30].forEach((limit) => {
      const chunks = layoutChunks(text, limit);
      chunks.forEach((chunk) => assert.ok(chunk.length <= limit, `${chunk} > ${limit}`));
      assert.equal(chunks.join('').replace(/\s/g, ''), text.replace(/\s/g, ''), 'todas as letras, na ordem');
      // Só divide uma palavra quando ela é maior que o limite.
      const words = text.split(/\s+/);
      if (words.every((word) => word.length <= limit)) assert.equal(chunks.join(' '), words.join(' '));
    });
  });
  assert.deepEqual(layoutChunks('supercalifragilístico', 8), ['supercal', 'ifragilí', 'stico']);
});

test('cada frase aparece inteira antes de apagar e cabe na tela', () => {
  const random = seeded(3);
  [20, 37, 44].forEach((rows) => {
    QUOTES.forEach((quote) => {
      let phrase = createPhrase(quote, 5, rows, random);
      const letters = formatQuote(quote).replace(/\s/g, '').length;
      while (phrase.written < phrase.total) phrase = advancePhrase(phrase, 0.2);
      const complete = phraseCells(phrase);
      assert.equal(complete.length, letters, 'todas as letras visíveis');
      assert.equal(complete.map((cell) => cell.char).join(''), formatQuote(quote).replace(/\s/g, ''), 'na ordem de leitura');
      complete.forEach((cell) => {
        assert.ok(cell.row >= 0 && cell.row < rows, `linha ${cell.row} fora da tela de ${rows}`);
        assert.ok(cell.alpha >= 0.6);
      });
      // Continua inteira durante a pausa e só depois apaga.
      phrase = advancePhrase(phrase, 1);
      assert.equal(phraseCells(phrase).length, letters);
      while (!phraseDone(phrase)) phrase = advancePhrase(phrase, 0.5);
    });
  });
});

test('a letra mais nova brilha durante a escrita', () => {
  let phrase = createPhrase({ text: 'Pergunte por quê.' }, 0, 30, seeded(1));
  phrase = advancePhrase(phrase, 0.5);
  const cells = phraseCells(phrase);
  assert.ok(cells.length > 0);
  assert.equal(cells.at(-1).isHead, true);
  assert.equal(cells.at(-1).alpha, 1);
});

test('o organizador não sobrepõe frases, respeita a densidade e não repete frases', () => {
  const random = seeded(11);
  let rain = seedRain(56, 37, random);
  for (let step = 0; step < 600; step += 1) {
    rain = stepRain(rain, 1 / 10, random);
    const columns = rain.phrases.flatMap((phrase) => phrase.chunks.map((_, offset) => phrase.column + offset));
    assert.equal(new Set(columns).size, columns.length, 'colunas sobrepostas');
    columns.forEach((column) => assert.ok(column >= 0 && column < 56));
    assert.ok(columns.length <= 56 * DENSITY + 8);
    const keys = rain.phrases.map((phrase) => phrase.key);
    assert.equal(new Set(keys).size, keys.length, 'frase repetida na tela');
    rainCells(rain).forEach((cell) => assert.ok(cell.row >= 0 && cell.row < 37));
  }
  assert.ok(rain.phrases.length > 0);
});

test('em telas estreitas também cabe ao menos uma frase', () => {
  const random = seeded(5);
  const rain = spawnPhrase(createRain(14, 44), random);
  assert.equal(rain.phrases.length, 1);
  assert.ok(chunkLimit(44) <= 42);
});
